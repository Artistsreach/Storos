import { GoogleGenAI, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from './utils.js'; // Assuming utils are moved or available
import { tools } from './desktop-tools.js';

export class GeminiDesktopLive {
  constructor(apiKey, onMessage, onError, onOpen, onClose, config = {}) {
    this.apiKey = apiKey;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onOpen = onOpen;
    this.onClose = onClose;
    this.config = config;
    this.isRecording = false;
    this.client = null;
    this.session = null;
    this.inputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    this.outputNode = this.outputAudioContext.createGain();
    this.nextStartTime = 0;
    this.mediaStream = null;
    this.sourceNode = null;
    this.scriptProcessorNode = null;
    this.sources = new Set();
  }

  async init() {
    console.log("GeminiLive: init");
    this.client = new GoogleGenAI({ apiKey: this.apiKey });
    this.outputNode.connect(this.outputAudioContext.destination);
    await this.initSession();
  }

  async initSession(sessionHandle = null) {
    const model = 'gemini-live-2.5-flash-preview';
    try {
      const sessionConfig = {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Orus' } },
        },
        contextWindowCompression: { slidingWindow: {} },
        ...this.config,
        tools,
        sessionResumption: { handle: sessionHandle }
      };

      this.session = await this.client.live.connect({
        model: model,
        callbacks: {
          onopen: () => {
            if (this.onOpen) this.onOpen();
          },
          onmessage: async (message) => {
            console.log("GeminiLive: onmessage", message);
            if (message.sessionResumptionUpdate && message.sessionResumptionUpdate.resumable && message.sessionResumptionUpdate.newHandle) {
              this.sessionHandle = message.sessionResumptionUpdate.newHandle;
            }
            if (this.onMessage) this.onMessage(message);

            // Dispatch text events for transcriptions so UI can mirror audio-mode chat
            try {
              const sc = message.serverContent || message.server_content || {};
              const turnComplete = !!(sc.turnComplete || sc.turn_complete);
              const outTx = sc.outputTranscription?.text || sc.output_transcription?.text;
              if (outTx) {
                const evt = new CustomEvent('gemini-live-text', { detail: { role: 'model', text: outTx, complete: turnComplete } });
                window.dispatchEvent(evt);
              }
              const inTx = sc.inputTranscription?.text || sc.input_transcription?.text;
              if (inTx) {
                const evt2 = new CustomEvent('gemini-live-text', { detail: { role: 'user', text: inTx, complete: turnComplete } });
                window.dispatchEvent(evt2);
              }
            } catch (e) {
              // ignore
            }

            if (message.toolCall) {
              const functionResponses = [];
              for (const fc of message.toolCall.functionCalls) {
                const event = new CustomEvent('gemini-tool-call', { detail: fc });
                window.dispatchEvent(event);
                functionResponses.push({
                  id: fc.id,
                  name: fc.name,
                  response: { result: "ok" }
                });
              }
              this.session.sendToolResponse({ functionResponses });
            }

            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData;
            if (audio) {
              this.nextStartTime = Math.max(
                this.nextStartTime,
                this.outputAudioContext.currentTime,
              );

              const audioBuffer = await decodeAudioData(
                decode(audio.data),
                this.outputAudioContext,
                24000,
                1,
              );
              const source = this.outputAudioContext.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(this.outputNode);
              source.addEventListener('ended', () => {
                this.sources.delete(source);
              });

              source.start(this.nextStartTime);
              this.nextStartTime = this.nextStartTime + audioBuffer.duration;
              this.sources.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of this.sources.values()) {
                source.stop();
                this.sources.delete(source);
              }
              this.nextStartTime = 0;
            }
          },
          onerror: (e) => {
            console.log("GeminiLive: onerror", e);
            if (this.onError) this.onError(e);
          },
          onclose: (e) => {
            console.log("GeminiLive: onclose", e);
            if (this.onClose) this.onClose(e);
          },
        },
        config: sessionConfig,
      });
    } catch (e) {
      console.error(e);
      if (this.onError) this.onError(e);
    }
  }

  async startRecording() {
    console.log("GeminiLive: startRecording");
    if (this.isRecording) return;
    this.inputAudioContext.resume();

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      this.sourceNode = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
      this.inputNode = this.inputAudioContext.createGain();
      this.sourceNode.connect(this.inputNode);

      const bufferSize = 256;
      this.scriptProcessorNode = this.inputAudioContext.createScriptProcessor(
        bufferSize,
        1,
        1,
      );

      this.scriptProcessorNode.onaudioprocess = (audioProcessingEvent) => {
        if (!this.isRecording) return;
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const pcmData = inputBuffer.getChannelData(0);
        this.session.sendRealtimeInput({ media: createBlob(pcmData) });
      };

      this.sourceNode.connect(this.scriptProcessorNode);
      this.scriptProcessorNode.connect(this.inputAudioContext.destination);

      this.isRecording = true;
    } catch (err) {
      console.error('Error starting recording:', err);
      if (this.onError) this.onError(err);
      this.stopRecording();
    }
  }

  stopRecording() {
    console.log("GeminiLive: stopRecording");
    if (!this.isRecording && !this.mediaStream && !this.inputAudioContext) return;
    this.isRecording = false;

    if (this.scriptProcessorNode && this.sourceNode) {
      this.scriptProcessorNode.disconnect();
      this.sourceNode.disconnect();
    }

    this.scriptProcessorNode = null;
    this.sourceNode = null;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  /**
   * Analyze a screenshot provided as a data URL (e.g., from canvas.toDataURL()).
   * Uses inlineData with Base64 bytes as recommended for <20MB requests.
   * Returns the model's text response.
   */
  async analyzeScreenshotDataUrl(dataUrl, prompt = 'Analyze this screenshot and summarize key UI elements, active files, and next actions.') {
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
    try {
      const [header, base64] = dataUrl.split(',');
      const mimeMatch = header?.match(/data:(.*);base64/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';

      const contents = [
        { inlineData: { data: base64, mimeType } },
        // Per tip: when using a single image with text, place the text AFTER the image
        prompt,
      ];

      const res = await this.client.models.generateContent({ model: 'gemini-2.5-flash', contents });
      return res.text?.trim() || '';
    } catch (e) {
      console.error('GeminiLive: analyzeScreenshotDataUrl failed', e);
      if (this.onError) this.onError(e);
      throw e;
    }
  }

  /**
   * Analyze a screenshot by fetching from a URL (smaller images recommended or use Files API for larger/repeated use).
   */
  async analyzeScreenshotFromUrl(imageUrl, prompt = 'Analyze this screenshot and summarize key UI elements, active files, and next actions.') {
    if (!this.client) {
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    }
    try {
      const resp = await fetch(imageUrl);
      if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`);
      const mimeType = resp.headers.get('content-type') || 'image/jpeg';
      const buf = await resp.arrayBuffer();
      // Convert to base64
      let base64 = '';
      {
        const bytes = new Uint8Array(buf);
        let binary = '';
        const chunkSize = 0x8000;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        base64 = btoa(binary);
      }

      const contents = [
        { inlineData: { data: base64, mimeType } },
        prompt,
      ];
      const res = await this.client.models.generateContent({ model: 'gemini-2.5-flash', contents });
      return res.text?.trim() || '';
    } catch (e) {
      console.error('GeminiLive: analyzeScreenshotFromUrl failed', e);
      if (this.onError) this.onError(e);
      throw e;
    }
  }

  reset() {
    if (this.session) {
      this.session.close();
    }
    this.initSession();
  }
}
