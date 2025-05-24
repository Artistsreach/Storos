import { GoogleGenAI, Modality } from '@google/genai';
import * as fs from "node:fs";
import pkg from 'wavefile';
const { WaveFile } = pkg;

// WARNING: It is unsafe to insert your API key into client-side JavaScript or TypeScript code.
// Use server-side deployments for accessing the Live API in production.
const GOOGLE_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GOOGLE_API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set for geminiLiveApi. Please add it to your .env file. Speech-to-speech will fail.");
}

const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
const model = 'gemini-2.0-flash-live-001'; // Or a native audio model like 'gemini-2.5-flash-preview-native-audio-dialog'

// Configuration for receiving audio response
const configReceiveAudio = { responseModalities: [Modality.AUDIO] };

// Configuration for receiving text response (e.g., for transcription)
const configReceiveText = { responseModalities: [Modality.TEXT] };

async function createLiveSession(config, customCallbacks = {}) {
    const responseQueue = [];

    const defaultCallbacks = {
        onopen: function () {
            console.debug('Live API session opened');
        },
        onmessage: function (message) {
            responseQueue.push(message);
            // console.debug('Live API message received:', message);
        },
        onerror: function (e) {
            console.error('Live API error:', e.message, e);
        },
        onclose: function (e) {
            console.debug('Live API session closed:', e ? e.reason : 'No reason provided');
        },
        ...customCallbacks
    };

    const session = await ai.live.connect({
        model: model,
        callbacks: defaultCallbacks,
        config: config,
    });

    async function waitMessage() {
        let done = false;
        let message = undefined;
        while (!done) {
            message = responseQueue.shift();
            if (message) {
                done = true;
            } else {
                await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for messages
            }
        }
        return message;
    }

    async function handleTurn() {
        const turns = [];
        let done = false;
        console.debug('Waiting for turn to complete...');
        while (!done) {
            const message = await waitMessage();
            turns.push(message);
            if (message.serverContent && message.serverContent.turnComplete) {
                console.debug('Turn complete.');
                done = true;
            } else if (message.error) {
                console.error("Error in turn:", message.error);
                done = true; // Exit if there's an error
            }
        }
        return turns;
    }

    return { session, handleTurn, responseQueue };
}

/**
 * Sends audio data to the Live API and receives an audio response.
 * @param {string} inputAudioFilePath Path to the input WAV audio file.
 * @param {string} outputAudioFilePath Path to save the output WAV audio file.
 */
export async function sendAndReceiveAudio(inputAudioFilePath, outputAudioFilePath = 'output.wav') {
    const { session, handleTurn } = await createLiveSession(configReceiveAudio);

    try {
        console.debug(`Reading audio file: ${inputAudioFilePath}`);
        const fileBuffer = fs.readFileSync(inputAudioFilePath);

        const wav = new WaveFile();
        wav.fromBuffer(fileBuffer);
        wav.toSampleRate(16000); // Ensure 16kHz sample rate for input
        wav.toBitDepth("16");   // Ensure 16-bit PCM
        // Mono is usually default or handled by toSampleRate/toBitDepth, but good to be aware.

        const base64Audio = wav.toBase64();
        console.debug('Sending audio data...');
        session.sendRealtimeInput({
            audio: {
                data: base64Audio,
                mimeType: "audio/pcm;rate=16000" // Input audio is 16kHz
            }
        });
        // According to docs, for sendRealtimeInput, we might need to signal activity end if not using automatic VAD
        // For simplicity, assuming automatic VAD or that a single chunk is one activity.
        // If using manual VAD:
        // await session.sendRealtimeInput({ activityStart: {} });
        // ... send audio ...
        // await session.sendRealtimeInput({ activityEnd: {} });


        console.debug('Waiting for audio response...');
        const turns = await handleTurn();
        const combinedAudioData = [];

        for (const turn of turns) {
            if (turn.data) { // Audio data is in turn.data for Modality.AUDIO
                // console.debug('Received audio data chunk.');
                const buffer = Buffer.from(turn.data, 'base64');
                // Audio output is 24kHz, 16-bit PCM.
                // The data is raw PCM, so we collect Int16Array parts.
                const intArray = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Int16Array.BYTES_PER_ELEMENT);
                combinedAudioData.push(...Array.from(intArray));
            } else if (turn.text) {
                console.debug('Received unexpected text (expecting audio):', turn.text);
            } else if (turn.error) {
                console.error('Error message from server:', turn.error);
            }
        }

        if (combinedAudioData.length > 0) {
            const audioBuffer = new Int16Array(combinedAudioData);
            const outputWav = new WaveFile();
            // Output audio is 24kHz, 16-bit PCM, mono (assumed, common for voice)
            outputWav.fromScratch(1, 24000, '16', audioBuffer);
            fs.writeFileSync(outputAudioFilePath, outputWav.toBuffer());
            console.debug(`Output audio saved to ${outputAudioFilePath}`);
        } else {
            console.debug('No audio data received in response.');
        }

    } catch (error) {
        console.error('Error in sendAndReceiveAudio:', error);
    } finally {
        session.close();
        console.debug('Session closed for sendAndReceiveAudio.');
    }
}

/**
 * Sends text to the Live API and receives a text response.
 * @param {string} textInput The text to send.
 */
export async function sendAndReceiveText(textInput) {
    const { session, handleTurn } = await createLiveSession(configReceiveText);
    let receivedText = "";

    try {
        console.debug(`Sending text: "${textInput}"`);
        session.sendClientContent({ turns: [{ role: "user", parts: [{ text: textInput }] }], turnComplete: true });
        // Or for simpler single turn: session.sendClientContent({ turns: textInput });

        console.debug('Waiting for text response...');
        const turns = await handleTurn();
        for (const turn of turns) {
            if (turn.text) {
                console.debug('Received text fragment:', turn.text);
                receivedText += turn.text;
            } else if (turn.data) { // Should not happen with Modality.TEXT
                console.warn('Received unexpected inline data (expecting text):', turn.data);
            } else if (turn.error) {
                console.error('Error message from server:', turn.error);
            }
        }
        console.debug('Full received text:', receivedText);
        return receivedText;

    } catch (error) {
        console.error('Error in sendAndReceiveText:', error);
    } finally {
        session.close();
        console.debug('Session closed for sendAndReceiveText.');
    }
}


// Example usage (can be called from another file)
async function runAudioExample() {
    // Create a dummy sample.wav for testing if it doesn't exist
    const sampleInputPath = 'sample_input.wav';
    if (!fs.existsSync(sampleInputPath)) {
        const wf = new WaveFile();
        // Create a 1-second sine wave at 440Hz, 16kHz, 16-bit, mono
        const duration = 1; // seconds
        const sampleRate = 16000;
        const frequency = 440;
        const amplitude = 32767 / 2; // Max amplitude for 16-bit, halved
        const samples = [];
        for (let i = 0; i < sampleRate * duration; i++) {
            samples.push(Math.round(amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate)));
        }
        wf.fromScratch(1, sampleRate, '16', new Int16Array(samples));
        fs.writeFileSync(sampleInputPath, wf.toBuffer());
        console.log(`Created dummy ${sampleInputPath} for testing.`);
    }
    await sendAndReceiveAudio(sampleInputPath, 'gemini_output.wav');
}

async function runTextExample() {
    const response = await sendAndReceiveText("Hello Gemini, how are you today?");
    console.log("Final response from text example:", response);
}

// To test, uncomment and run:
// Ensure GOOGLE_API_KEY is set.
// (async () => {
//   try {
//     // console.log("Running Text Example...");
//     // await runTextExample();
//     // console.log("\nRunning Audio Example...");
//     // await runAudioExample(); // Make sure 'sample_input.wav' exists or is created
//   } catch (e) {
//     console.error("Error in main execution:", e);
//   }
// })();

// Note on API Key:
// For a real application, especially client-side, you would not embed the API key directly.
// You'd typically have a backend server that handles the API calls.
// The client would send audio/text to your server, your server communicates with Gemini,
// and then streams/sends the response back to the client.
// This file assumes a Node.js server-side environment for direct API interaction.

// Further considerations for speech-to-speech:
// 1. Microphone Input: For live speech-to-speech, you'd need to capture audio from the microphone.
//    Libraries like 'node-record-lpcm16' or browser APIs (MediaRecorder) can be used.
// 2. Streaming Input: Send audio chunks in real-time as they are captured.
//    The `sendRealtimeInput` method is designed for this.
// 3. Streaming Output: Play back received audio chunks as they arrive.
//    Browser AudioContext or server-side audio playback libraries would be needed.
// 4. Voice Activity Detection (VAD): Crucial for knowing when the user starts/stops speaking.
//    Gemini Live API has built-in VAD, or you can implement client-side VAD.
// 5. User Interface: To manage recording, playback, and display transcriptions if needed.

export { Modality }; // Export Modality if it's needed by other modules using these functions.
