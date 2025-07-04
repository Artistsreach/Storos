import { GoogleGenAI, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from './utils.js'; // Assuming utils are moved or available

export class GeminiLive {
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

  reset() {
    if (this.session) {
      this.session.close();
    }
    this.initSession();
  }
}
