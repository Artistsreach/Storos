import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_REALTIME_SESSIONS_URL = 'https://api.openai.com/v1/realtime/sessions';

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY environment variable');
    return new Response(
      JSON.stringify({ error: 'Server configuration error: Missing OpenAI API Key' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  try {
    // Default payload based on documentation examples and common use cases
    let sessionPayload = {
      model: 'gpt-4o-realtime-preview', // Or specific model like "gpt-4o-realtime-preview-2024-12-17" if needed
      modalities: ['audio', 'text'],
      instructions: 'You are a friendly and helpful AI assistant for an e-commerce store. Be concise and helpful.',
      voice: 'alloy', // Default voice, e.g., alloy, echo, fable, onyx, nova, shimmer
      input_audio_format: 'pcm16', // pcm16, g711_ulaw, or g711_alaw
      output_audio_format: 'pcm16',
      temperature: 0.8,
      // Enable server-side VAD by default
      turn_detection: {
        type: 'server_vad', // 'server_vad' or 'semantic_vad'
        threshold: 0.5,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
        create_response: true, // Automatically create response on VAD stop
        interrupt_response: true, // Interrupt ongoing response on VAD start
      },
      input_audio_transcription: { // Optional, but useful for seeing what the model "hears"
        model: 'whisper-1', // or gpt-4o-transcribe, gpt-4o-mini-transcribe
        // language: "en", // Optional: Specify language for transcription
      },
      // max_response_output_tokens: "inf", // Optional
      // tools: [], // Optional
      // tool_choice: "auto", // Optional
    };

    // Allow client to send a JSON body to override some defaults, especially 'instructions'
    if (req.body && req.headers.get('content-type')?.includes('application/json')) {
      try {
        const clientPayload = await req.json();
        if (clientPayload.instructions) {
          sessionPayload.instructions = clientPayload.instructions;
        }
        // Client could potentially override other fields like voice, model if desired
        if (clientPayload.voice) sessionPayload.voice = clientPayload.voice;
        if (clientPayload.model) sessionPayload.model = clientPayload.model;
        // Add more overrides as needed
      } catch (e) {
        console.warn("Could not parse JSON from request body or invalid payload, using default session parameters.", e.message);
      }
    }

    console.log("Requesting OpenAI Realtime session with payload:", JSON.stringify(sessionPayload, null, 2));

    const openaiResponse = await fetch(OPENAI_REALTIME_SESSIONS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionPayload),
    });

    const responseBodyText = await openaiResponse.text(); // Read body once

    if (!openaiResponse.ok) {
      console.error('OpenAI API error:', openaiResponse.status, responseBodyText);
      return new Response(
        JSON.stringify({ error: 'Failed to create OpenAI Realtime session', details: responseBodyText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: openaiResponse.status }
      );
    }

    const responseData = JSON.parse(responseBodyText); // Parse after checking ok
    console.log("OpenAI Realtime session created successfully. Session ID:", responseData.id);

    return new Response(
      JSON.stringify(responseData), // Contains client_secret
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error creating OpenAI Realtime session token:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
