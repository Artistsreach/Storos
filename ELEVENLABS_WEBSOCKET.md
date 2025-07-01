# ElevenLabs Text-to-Speech WebSocket API

The Text-to-Speech WebSockets API is designed to generate audio from partial text input while ensuring consistency throughout the generated audio. Although highly flexible, the WebSockets API isn’t a one-size-fits-all solution. It’s well-suited for scenarios where:

- The input text is being streamed or generated in chunks.
- Word-to-audio alignment information is required.

However, it may not be the best choice when:

- The entire input text is available upfront. Given that the generations are partial, some buffering is involved, which could potentially result in slightly higher latency compared to a standard HTTP request.
- You want to quickly experiment or prototype. Working with WebSockets can be harder and more complex than using a standard HTTP API, which might slow down rapid development and testing.

## Handshake

**WSS**

`wss://api.elevenlabs.io/v1/text-to-speech/:voice_id/stream-input`

**Headers**

- `xi-api-key` (string, Required)

**Path parameters**

- `voice_id` (string, Required): The unique identifier for the voice to use in the TTS process.

**Query parameters**

- `authorization` (string, Optional): Your authorization bearer token.
- `model_id` (string, Optional): The model ID to use.
- `language_code` (string, Optional): The ISO 639-1 language code (for specific models).
- `enable_logging` (boolean, Optional, Defaults to true): Whether to enable logging of the request.
- `enable_ssml_parsing` (boolean, Optional, Defaults to false): Whether to enable SSML parsing.
- `output_format` (enum, Optional): The output audio format.
- `inactivity_timeout` (integer, Optional, Defaults to 20): Timeout for inactivity before a context is closed (seconds), can be up to 180 seconds.
- `sync_alignment` (boolean, Optional, Defaults to false): Whether to include timing data with every audio chunk.
- `auto_mode` (boolean, Optional, Defaults to false): Reduces latency by disabling chunk schedule and buffers. Recommended for full sentences/phrases.
- `apply_text_normalization` (enum, Optional, Defaults to auto): This parameter controls text normalization with three modes - ‘auto’, ‘on’, and ‘off’.
- `seed` (integer, Optional): If specified, system will best-effort sample deterministically. Integer between 0 and 4294967295.

## Messages

### Send

**initializeConnection** (object, Required)

- `text`: `" "` (Required) - The initial text that must be sent is a blank space.
- `voice_settings` (object, Optional)
- `generation_config` (object, Optional)
- `pronunciation_dictionary_locators` (list of objects, Optional)
- `xi-api-key` (string, Optional)
- `authorization` (string, Optional)

**sendText** (object, Required)

- `text` (string, Required): The text to be sent to the API for audio generation. Should always end with a single space string.
- `try_trigger_generation` (boolean, Optional, Defaults to false)
- `voice_settings` (object, Optional)
- `generator_config` (object, Optional)
- `flush` (boolean, Optional, Defaults to false)

**closeConnection** (object, Required)

- `text`: `""` (Required) - End the stream with an empty string

### Receive

**audioOutput** (object, Required)

- `audio` (string, Required): A generated partial audio chunk, encoded using the selected output_format.
- `normalizedAlignment` (object, Optional)
- `alignment` (object, Optional)

**finalOutput** (object, Required)

- `isFinal`: `true` (Optional, Defaults to true) - Indicates if the generation is complete.

---

# Multi-Context WebSocket

The Multi-Context Text-to-Speech WebSockets API allows for generating audio from text input while managing multiple independent audio generation streams (contexts) over a single WebSocket connection. This is useful for scenarios requiring concurrent or interleaved audio generations, such as dynamic conversational AI applications.

Each context, identified by a context id, maintains its own state. You can send text to specific contexts, flush them, or close them independently. A close_socket message can be used to terminate the entire connection gracefully.

For more information on best practices for how to use this API, please see the multi context websocket guide.

## Handshake

**WSS**

`wss://api.elevenlabs.io/v1/text-to-speech/:voice_id/multi-stream-input`

**Headers**

- `xi-api-key` (string, Required)

**Path parameters**

- `voice_id` (string, Required)

**Query parameters**

- `authorization` (string, Optional)
- `model_id` (string, Optional)
- `language_code` (string, Optional)
- `enable_logging` (boolean, Optional, Defaults to true)
- `enable_ssml_parsing` (boolean, Optional, Defaults to false)
- `output_format` (enum, Optional)
- `inactivity_timeout` (integer, Optional, Defaults to 20)
- `sync_alignment` (boolean, Optional, Defaults to false)
- `auto_mode` (boolean, Optional, Defaults to false)
- `apply_text_normalization` (enum, Optional, Defaults to auto)
- `seed` (integer, Optional)

## Messages

### Send

**initializeConnectionMulti** (object, Required)

- `text`: `" "` (Required)
- `voice_settings` (object, Optional)
- `generation_config` (object, Optional)
- `pronunciation_dictionary_locators` (list of objects, Optional)
- `xi-api-key` (string, Optional)
- `authorization` (string, Optional)
- `context_id` (string, Optional)

**initialiseContext** (object, Required)

- `text` (string, Required)
- `voice_settings` (object, Optional)
- `generation_config` (object, Optional)
- `pronunciation_dictionary_locators` (list of objects, Optional)
- `xi-api-key` (string, Optional)
- `authorization` (string, Optional)
- `context_id` (string, Optional)

**sendTextMulti** (object, Required)

- `text` (string, Required)
- `context_id` (string, Optional)
- `flush` (boolean, Optional, Defaults to false)

**flushContextClient** (object, Required)

- `context_id` (string, Required)
- `flush` (boolean, Required)
- `text` (string, Optional)

**closeContextClient** (object, Required)

- `context_id` (string, Required)
- `close_context` (boolean, Required)

**closeSocketClient** (object, Required)

- `close_socket` (boolean, Optional, Defaults to false)

**keepContextAlive** (object, Required)

- `text`: `""` (Required)
- `context_id` (string, Required)

### Receive

**audioOutputMulti** (object, Required)

- `audio` (string, Required)
- `normalizedAlignment` (object or null, Optional)
- `alignment` (object or null, Optional)
- `contextId` (string, Optional)

**finalOutputMulti** (object, Required)

- `isFinal`: `true` (Required)
- `contextId` (string, Optional)

---

# Create speech

**POST**

`https://api.elevenlabs.io/v1/text-to-speech/:voice_id`

Converts text into speech using a voice of your choice and returns audio.

**Path parameters**

- `voice_id` (string, Required): ID of the voice to be used.

**Headers**

- `xi-api-key` (string, Required)

**Query parameters**

- `enable_logging` (boolean, Optional, Defaults to true)
- `optimize_streaming_latency` (integer or null, Optional, Deprecated)
- `output_format` (enum, Optional, Defaults to mp3_44100_128)

**Request**

- `text` (string, Required)
- `model_id` (string, Optional, Defaults to eleven_multilingual_v2)
- `language_code` (string or null, Optional)
- `voice_settings` (object or null, Optional)
- `pronunciation_dictionary_locators` (list of objects or null, Optional)
- `seed` (integer or null, Optional)
- `previous_text` (string or null, Optional)
- `next_text` (string or null, Optional)
- `previous_request_ids` (list of strings or null, Optional)
- `next_request_ids` (list of strings or null, Optional)
- `apply_text_normalization` (enum, Optional, Defaults to auto)
- `apply_language_text_normalization` (boolean, Optional, Defaults to false)
- `use_pvc_as_ivc` (boolean, Optional, Defaults to false, Deprecated)

---

# Stream speech

**POST**

`https://api.elevenlabs.io/v1/text-to-speech/:voice_id/stream`

Converts text into speech using a voice of your choice and returns audio as an audio stream.

**Path parameters**

- `voice_id` (string, Required)

**Headers**

- `xi-api-key` (string, Required)

**Query parameters**

- `enable_logging` (boolean, Optional, Defaults to true)
- `optimize_streaming_latency` (integer or null, Optional, Deprecated)
- `output_format` (enum, Optional, Defaults to mp3_44100_128)

**Request**

- `text` (string, Required)
- `model_id` (string, Optional, Defaults to eleven_multilingual_v2)
- `language_code` (string or null, Optional)
- `voice_settings` (object or null, Optional)
- `pronunciation_dictionary_locators` (list of objects or null, Optional)
- `seed` (integer or null, Optional)
- `previous_text` (string or null, Optional)
- `next_text` (string or null, Optional)
- `previous_request_ids` (list of strings or null, Optional)
- `next_request_ids` (list of strings or null, Optional)
- `apply_text_normalization` (enum, Optional, Defaults to auto)
- `apply_language_text_normalization` (boolean, Optional, Defaults to false)
- `use_pvc_as_ivc` (boolean, Optional, Defaults to false, Deprecated)
