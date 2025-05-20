import { serve } from 'std/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { connectWebSocket, WebSocketError } from "wocket";

// OPENAI_API_KEY is used by the `create-openai-realtime-session` function to get an ephemeral token.
// This proxy will use the ephemeral token passed by the client.
// const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY'); // Not directly used by this proxy's WS connection logic

const DEFAULT_OPENAI_MODEL = 'gpt-4o-realtime-preview';
const OPENAI_REALTIME_WEBSOCKET_BASE_URL = 'wss://api.openai.com/v1/realtime';

// if (!OPENAI_API_KEY) {
//   console.error('CRITICAL: Missing OPENAI_API_KEY environment variable. This might be needed by other parts or the session creation function.');
// }

serve(async (req: Request) => {
  const url = new URL(req.url);
  const ephemeralToken = url.searchParams.get("token");
  const modelFromQuery = url.searchParams.get("model");

  if (!ephemeralToken) {
    return new Response(JSON.stringify({ error: 'Missing session token. Please provide the token as a query parameter.' }), {
      status: 400, // Bad Request
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const upgrade = req.headers.get('upgrade') || '';
  if (upgrade.toLowerCase() !== 'websocket') {
    return new Response('Request isn\'t trying to upgrade to websocket.', { status: 400, headers: corsHeaders });
  }

  const { socket: clientSocket, response: clientResponse } = Deno.upgradeWebSocket(req);

  let openaiSocket: WebSocket | null = null;

  clientSocket.onopen = async () => {
    console.log('Client WebSocket connected. Attempting to connect to OpenAI Realtime API...');
    try {
      const modelForSession = modelFromQuery || DEFAULT_OPENAI_MODEL;
      const openaiWebSocketUrl = `${OPENAI_REALTIME_WEBSOCKET_BASE_URL}?model=${modelForSession}`;
      
      console.log(`Connecting to OpenAI at: ${openaiWebSocketUrl} using token.`);

      const headers = {
        'Authorization': `Bearer ${ephemeralToken}`,
        'OpenAI-Beta': 'realtime=v1' // Standard way to specify beta features
      };

      // Use wocket to connect with custom headers
      openaiSocket = await connectWebSocket(openaiWebSocketUrl, { headers });

      // This is wocket's onopen, confirming connection to OpenAI
      // connectWebSocket resolves after successful connection, so onopen callback for wocket itself is implicit.
      console.log('Successfully connected to OpenAI Realtime API via wocket.');

      openaiSocket.onmessage = (openaiEvent) => {
        // console.log('Message from OpenAI:', openaiEvent.data);
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(openaiEvent.data as string);
        }
      };

      openaiSocket.onclose = (closeEvent) => {
        console.log('Disconnected from OpenAI Realtime API:', closeEvent.code, closeEvent.reason);
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.close(closeEvent.code || 1000, `OpenAI upstream closed: ${closeEvent.reason || 'Unknown reason'}`);
        }
        openaiSocket = null;
      };

      openaiSocket.onerror = (errorEvent) => { // This is error on the established wocket connection
        console.error('Error with OpenAI Realtime API WebSocket (wocket):', errorEvent);
        if (clientSocket.readyState === WebSocket.OPEN) {
          clientSocket.send(JSON.stringify({type: "error", error: {message: "OpenAI upstream connection error."}}));
        }
        // No need to close openaiSocket here, wocket's onclose should handle it.
        openaiSocket = null; // Ensure it's nulled
      };

    } catch (err) {
      console.error('Failed to establish connection with OpenAI (wocket):', err);
      let errorMessage = "Failed to connect to AI service.";
      if (err instanceof WebSocketError) { // WebSocketError from wocket during connection attempt
        errorMessage = `AI Connection Error: ${err.message}${err.response ? ` (Status: ${err.response.status})` : ''}`;
        console.error(`Wocket connection details: URL: ${err.response?.url}, Status: ${err.response?.status}`);
        // err.response.text() could give more details if awaited
      } else if (err instanceof Error) {
        errorMessage = `AI Connection Error: ${err.message}`;
      }

      if (clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(JSON.stringify({type: "error", error: {message: errorMessage}}));
        clientSocket.close(1011, 'Upstream connection failure');
      }
      // openaiSocket would be null or already handled if error is from connectWebSocket
      openaiSocket = null;
    }
  };

  clientSocket.onmessage = async (event) => {
    const clientData = event.data as string;
    // console.log('Message from client:', clientData);

    if (openaiSocket && openaiSocket.readyState === WebSocket.OPEN) {
      openaiSocket.send(clientData);
    } else {
      console.warn('OpenAI socket not ready or not connected. Client message not forwarded.');
      if (clientSocket.readyState === WebSocket.OPEN) {
         clientSocket.send(JSON.stringify({type: "error", error: {message: "AI service not connected. Please try again or reconnect."}}));
      }
    }
  };

  clientSocket.onclose = (event) => {
    console.log('Client WebSocket disconnected:', event.code, event.reason);
    if (openaiSocket && openaiSocket.readyState === WebSocket.OPEN) {
      openaiSocket.close(1000, 'Client disconnected');
    }
    openaiSocket = null;
  };

  clientSocket.onerror = (error) => { // Error on the clientSocket itself
    console.error('Client WebSocket error:', error);
    if (openaiSocket && (openaiSocket.readyState === WebSocket.OPEN || openaiSocket.readyState === WebSocket.CONNECTING)) {
      openaiSocket.close(1011, 'Client error');
    }
    openaiSocket = null;
  };

  return clientResponse;
});
