import React, { useState, useEffect, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useToast } from '../../components/ui/use-toast';
import { GoogleGenAI, Type } from "@google/genai";
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Send, Settings2, X, MessageCircle, Mic, Loader2, ArrowUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom'; 
import ProductCardInChat from './ProductCardInChat';
import { GeminiLive } from '../../lib/geminiLive';

// Import the centralized product visualizer function
import { generateProductVisualization } from '../../lib/productVisualizer';


const SearchPageChatbot = ({ productToAnalyze, isOpen: propIsOpen, setIsOpen: propSetIsOpen }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const functions = getFunctions();
  const { currentStore, addToCart: contextAddToCart, getProductById, updateQuantity: contextUpdateQuantity, viewMode } = useStore(); // Added viewMode
  const { userRole } = useAuth(); // Get userRole
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [isOpen, setIsOpen] = useState(propIsOpen);
  const [showKnowledgeBaseInput, setShowKnowledgeBaseInput] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState(
    'You are a helpful AI assistant.'
  );
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeService, setActiveService] = useState(null);
  const [geminiChat, setGeminiChat] = useState(null);
  const [geminiLive, setGeminiLive] = useState(null);
  const [isLive, setIsLive] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input
  const [visualizingProduct, setVisualizingProduct] = useState(null); // To store product info during visualization

  const [isGeminiInitializing, setIsGeminiInitializing] = useState(false);
  const isInitialServiceSetupDoneRef = useRef(false);

  useEffect(() => {
    if (productToAnalyze && geminiChat) {
      if (productToAnalyze.type === 'analyze') {
        handleSendGeminiMessage(
          `Please analyze this product: ${JSON.stringify(
            productToAnalyze.product
          )}`
        );
      } else if (productToAnalyze.type === 'compare') {
        handleSendGeminiMessage(
          `Please compare the following product: ${JSON.stringify(
            productToAnalyze.product
          )} with the other products in this list: ${JSON.stringify(
            productToAnalyze.allProducts
          )}`
        );
      }
    }
  }, [productToAnalyze, geminiChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const scrollToTop = () => {
    chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addSystemMessage = (text, type = 'system') => {
    // console.log(`[SYSTEM MESSAGE - ${type.toUpperCase()}]: ${text}`);
  };

  const toggleChatbot = () => propSetIsOpen(!isOpen);
  const toggleKnowledgeBaseInput = () => setShowKnowledgeBaseInput(!showKnowledgeBaseInput);

  const handleSaveKnowledgeBase = () => {
    setShowKnowledgeBaseInput(false);
  };

  const handleSendMessage = (textOverride = null) => {
    const messageText = typeof textOverride === 'string' ? textOverride : currentMessage;
    if (messageText.trim() === '') return;
    
    const userMessageId = `user-text-${Date.now()}`;
    setMessages(prev => [...prev, { id: userMessageId, role: 'user', text: messageText }]);
    if (typeof textOverride !== 'string') {
      setCurrentMessage('');
    }

    if (activeService === 'gemini' && geminiChat) {
      handleSendGeminiMessage(messageText);
    } else {
      console.error("Error: Gemini chat not active. Cannot send message.");
    }
  };

  const handleLiveToggle = async () => {
    if (isLive) {
      geminiLive.stopRecording();
      setIsLive(false);
    } else {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        console.error("Gemini API Key not configured.");
        return;
      }
      const live = new GeminiLive(
        apiKey,
        (message) => {
          const assistantText = message.serverContent?.outputTranscription?.text || message.serverContent?.modelTurn?.parts[0]?.text;
          if (assistantText) {
            setMessages(prev => {
              const lastMessage = prev.length > 0 ? prev[prev.length - 1] : null;
              if (lastMessage && lastMessage.role === 'assistant' && lastMessage.id.startsWith('assistant-live-')) {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { ...lastMessage, text: lastMessage.text + assistantText };
                return newMessages;
              } else {
                const assistantMessageId = `assistant-live-${Date.now()}`;
                return [...prev, { id: assistantMessageId, role: 'assistant', text: assistantText }];
              }
            });
          }

          if (message.serverContent?.inputTranscription) {
            const userText = message.serverContent.inputTranscription.text;
            setMessages(prev => {
              const lastMessage = prev.length > 0 ? prev[prev.length - 1] : null;
              if (lastMessage && lastMessage.role === 'user' && lastMessage.id.startsWith('user-live-')) {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { ...lastMessage, text: userText };
                return newMessages;
              } else {
                const userMessageId = `user-live-${Date.now()}`;
                return [...prev, { id: userMessageId, role: 'user', text: userText }];
              }
            });
          }
          
          if (message.toolCall) {
            handleLiveFunctionExecution(message.toolCall);
          }
        },
        () => {
          console.log("Gemini Live session opened.");
        },
        () => {
          console.log("Gemini Live session closed.");
        },
        {
          systemInstruction: knowledgeBase,
        }
      );
      await live.init();
      setGeminiLive(live);
      live.startRecording();
      setIsLive(true);
    }
  };

  const handleSendGeminiMessage = async (text) => {
    if (!geminiChat) {
      console.error("Gemini chat not initialized.");
      return;
    }
    try {
      const stream = await geminiChat.sendMessageStream({ message: [{ text: text }] });
      const assistantMessageId = `assistant-gemini-${Date.now()}`;
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', text: "", functionCallData: null }]);

      let accumulatedText = "";
      let detectedFunctionCall = null;

      for await (const chunk of stream) {
        let functionCallInChunk = null;
        if (chunk.functionCalls && chunk.functionCalls.length > 0) {
          functionCallInChunk = chunk.functionCalls[0];
        } else if (chunk.functionCall) {
          functionCallInChunk = chunk.functionCall;
        }

        if (functionCallInChunk) {
          detectedFunctionCall = functionCallInChunk;
        }
        
        const chunkText = chunk.text;
        if (chunkText) {
          accumulatedText += chunkText;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId ? { ...msg, text: accumulatedText } : msg
            )
          );
        }
      } 

      if (detectedFunctionCall) {
        setMessages(prev =>
          prev.map(msg => {
            if (msg.id === assistantMessageId) {
              let textForFunctionCall = `(Function call: ${detectedFunctionCall.name})`;
              if (detectedFunctionCall.name === 'find_and_open_product') {
                textForFunctionCall = "Searching for product…";
              }
              const newText = accumulatedText.trim() === "" ?
                textForFunctionCall : 
                `${accumulatedText}\n${textForFunctionCall}`;
              return { ...msg, text: newText, functionCallData: detectedFunctionCall };
            }
            return msg;
          })
        );
        await handleFunctionExecution(detectedFunctionCall, assistantMessageId);
      } else if (accumulatedText.trim() !== "") {
        // UI message removed
      } else {
        setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId ? { ...msg, text: "(Assistant responded without text)" } : msg
            )
        );
      }
    } catch (err) {
      console.error("Error sending/receiving Gemini message:", err);
    }
  };
  
  const initializeGeminiChat = async () => {
    if (geminiChat || isGeminiInitializing) return;
    setIsGeminiInitializing(true);

    const model = productToAnalyze?.type === 'compare' ? 'gemini-2.5-pro' : 'gemini-2.5-flash-lite-preview-06-17';

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error("Gemini API Key not configured.");
      setIsGeminiInitializing(false);
      setActiveService(null);
      return;
    }

    try {
      const genAI = new GoogleGenAI({ apiKey });

      const uiMessageHistory = messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.text || "" }],
        }));
      
      const validHistory = uiMessageHistory.filter(item => 
        item.parts.every(part => typeof part.text === 'string' && part.text.trim() !== "")
      );

      const configForChat = {
        systemInstruction: knowledgeBase,
      };

      if (productToAnalyze?.type === 'compare') {
        configForChat.thinkingConfig = {
          thinkingBudget: 1024,
        };
        setKnowledgeBase('You are a product comparison expert. You will be given a product and a list of other products. Your task is to provide a detailed comparison of the main product against the others. For each product, you must display the product image. Be friendly, helpful, and format your responses using Markdown.');
      } else {
        setKnowledgeBase('You are a product analysis expert. You will be given a product. Your task is to provide a detailed analysis of the product for a consumer. Be friendly, helpful, and format your responses using Markdown.');
      }

      const chat = genAI.chats.create({
        model,
        history: validHistory,
        config: configForChat,
        generationConfig: {
          // maxOutputTokens: 200,
        },
      });

      if (!chat) { 
        throw new Error("genAI.chats.create() returned a null or undefined chat instance.");
      }

      setGeminiChat(chat);
      setActiveService('gemini');
      isInitialServiceSetupDoneRef.current = false; 
    } catch (err) {
      console.error("Error initializing Gemini chat:", err);
      setGeminiChat(null); 
      setActiveService(null); 
    } finally {
      setIsGeminiInitializing(false);
    }
  };
  
  const closeConnections = () => {
    setGeminiChat(null);
    setIsGeminiInitializing(false);
    setActiveService(null);
    isInitialServiceSetupDoneRef.current = false; 
  };

  useEffect(() => {
    if (isOpen) {
      if (!geminiChat && !isGeminiInitializing) {
        initializeGeminiChat();
      }
    } else {
      closeConnections();
    }
    return () => closeConnections();
  }, [isOpen]); 

  useEffect(() => {
    if (activeService === 'gemini') {
      if (!isInitialServiceSetupDoneRef.current) {
        isInitialServiceSetupDoneRef.current = true;
      } else if (knowledgeBase && !isGeminiInitializing && geminiChat) {
        setGeminiChat(null); 
        isInitialServiceSetupDoneRef.current = false; 
        initializeGeminiChat();
      }
    } else {
      isInitialServiceSetupDoneRef.current = false;
    }
  }, [knowledgeBase, activeService, isGeminiInitializing, geminiChat]); 

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={() => {}} 
      />
      {!isOpen && (
        <Button 
          onClick={toggleChatbot} 
          className="fixed bottom-[96px] right-0 py-4 pl-4 pr-1.5 shadow-lg z-50 rounded-tl-[20px] rounded-bl-[20px] rounded-tr-none rounded-br-none" 
          size="icon" 
          aria-label="Open Chatbot"
          style={{ backgroundColor: currentStore?.theme?.primaryColor || '#007bff' }} 
        >
          <MessageCircle size={20} />
        </Button>
      )}
      {isOpen && (
        <Card className="fixed bottom-[96px] right-4 left-4 sm:left-auto sm:w-full sm:max-w-md h-[70vh] max-h-[600px] shadow-xl z-[1000] flex flex-col bg-background border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
            <CardTitle className="text-md font-semibold">AI Assistant</CardTitle>
            <div className="flex items-center gap-1">
              {(userRole === 'admin' || viewMode === 'edit') && ( // Updated condition
                <Button variant="ghost" size="icon" onClick={toggleKnowledgeBaseInput} title="Set Knowledge Base">
                  <Settings2 size={18} />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={toggleChatbot} title="Close Chat">
                <X size={18} />
              </Button>
            </div>
          </CardHeader>
          
          {showKnowledgeBaseInput && ( // This section remains unchanged
            <div className="p-3 border-b bg-muted/40">
              <label htmlFor="knowledgeBaseInput" className="text-xs font-medium mb-1 block text-muted-foreground">
                Knowledge Base (Instructions for Gemini)
              </label>
              <Textarea
                id="knowledgeBaseInput"
                placeholder="Enter instructions for the assistant..."
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value)}
                className="h-28 text-xs mb-2 rounded-md"
              />
              <Button 
                onClick={handleSaveKnowledgeBase} 
                size="sm" 
                className="w-full"
                disabled={isGeminiInitializing || !geminiChat} 
              >
                Save & Apply Instructions
              </Button>
            </div>
          )}

          <CardContent ref={chatContainerRef} className="flex-grow p-3 overflow-y-auto space-y-3">
            {messages.map((msg, index) => (
              (msg.role === 'user' || msg.role === 'assistant') && (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-2.5 rounded-lg text-sm ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 
                      'bg-muted rounded-bl-none' 
                    }`}>
                    {msg.role === 'assistant' ? (
                      <>
                        {msg.productCardData && (
                          <ProductCardInChat
                            productData={msg.productCardData}
                            onViewDetails={() => {}}
                            onAddToCart={() => {}}
                            onBuyNow={() => {}}
                            onVisualize={() => {}}
                            isCreatingCheckout={isCreatingCheckout}
                          />
                        )}
                        {/* Handling for image data in message */}
                        {msg.imageDataUrl && (
                          <img src={msg.imageDataUrl} alt="Generated visualization" className="max-w-full h-auto rounded-md my-2" />
                        )}
                        {msg.text && (
                          <div className={`prose prose-sm max-w-none dark:prose-invert ${msg.productCardData || msg.imageDataUrl ? 'mt-2' : ''}`}>
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        )}
                        {!msg.productCardData && !msg.text && !msg.imageDataUrl && <p className="whitespace-pre-wrap">(Assistant message)</p>}
                      </>
                    ) : ( 
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                  {msg.role === 'assistant' && index === messages.length - 1 && (
                    <div className="flex justify-end w-full mt-2">
                        <Button
                            onClick={scrollToTop}
                            size="icon"
                            title="Scroll to top"
                            className="dark:bg-black dark:text-white dark:hover:bg-gray-800"
                        >
                            <ArrowUp size={18} />
                        </Button>
                    </div>
                  )}
                </div>
              )
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          
          <CardFooter className="p-3 border-t">
            <div className="flex w-full items-center gap-2">
              <Textarea
                placeholder="Type a message..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                className="flex-grow resize-none text-sm p-2 rounded-md min-h-[40px] max-h-[100px]"
                rows={1}
                disabled={!activeService || isGeminiInitializing} 
              />
              <Button
                onClick={() => handleSendMessage()}
                size="icon"
                variant="ghost"
                title="Send Message"
                disabled={!currentMessage.trim() || !activeService || isGeminiInitializing}
                className="text-black dark:text-white"
              >
                <Send size={18} />
              </Button>
              <Button
                onClick={handleLiveToggle}
                size="icon"
                title={isLive ? "Stop Live" : "Start Live"}
                className={`${isLive ? 'bg-red-500' : 'dark:bg-black dark:text-white dark:hover:bg-gray-800'}`}
              >
                <Mic size={18} />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default SearchPageChatbot;
