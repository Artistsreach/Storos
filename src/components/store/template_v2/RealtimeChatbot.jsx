import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Settings2, X, MessageCircle } from 'lucide-react'; 
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom'; 
import ProductCardInChat from './ProductCardInChat';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe.js with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

// Import the centralized product visualizer function
import { generateProductVisualization } from '@/lib/productVisualizer';


const RealtimeChatbot = () => {
  const navigate = useNavigate(); 
  const { currentStore, addToCart: contextAddToCart, getProductById, updateQuantity: contextUpdateQuantity, viewMode } = useStore(); // Added viewMode
  const { userRole } = useAuth(); // Get userRole
  const [isOpen, setIsOpen] = useState(false);
  const [showKnowledgeBaseInput, setShowKnowledgeBaseInput] = useState(false);
  const [knowledgeBase, setKnowledgeBase] = useState(
    'You are a friendly and helpful AI assistant for an e-commerce store. Be concise and helpful. Always format your responses using Markdown. If a user asks you to find a product, your primary action should be to use the `find_and_open_product` function. **Only after the `find_and_open_product` function successfully returns product details (indicated by `product_found: true` in the function\'s result) should you then say something like "Here is the product I found for you:".** At that point, a product card will also be displayed by the UI. Following your acknowledgment, you MUST ask a relevant follow-up question, such as "Would you like to see more details, add it to your cart, or keep browsing?". If the function call indicates the product was not found (`product_found: false`), you should inform the user you could not find the product and offer to search again or help with something else. Do not repeat raw product data (like image URLs or full product objects) in your text response, as the card already displays this information.'
  );
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [activeService, setActiveService] = useState(null);
  const [geminiChat, setGeminiChat] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input
  const [visualizingProduct, setVisualizingProduct] = useState(null); // To store product info during visualization

  const [isGeminiInitializing, setIsGeminiInitializing] = useState(false); 
  const isInitialServiceSetupDoneRef = useRef(false); 

  // --- Function Declarations for Gemini ---
  const findAndOpenProductDeclaration = { 
    name: 'find_and_open_product', 
    description: 'Finds a product based on a query (name, keywords, or ID) and returns its details for display. It does NOT navigate. After displaying, ask if the user wants to navigate or add to cart.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_query: {
          type: Type.STRING,
          description: 'The name, keywords, or ID of the product to find.',
        },
      },
      required: ['product_query'],
    },
  };

  const navigateToProductDetailDeclaration = {
    name: 'navigate_to_product_detail_page',
    description: 'Navigates the user to the detailed page for a specific product, given its ID.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING, description: 'The unique ID of the product.' },
        product_name: { type: Type.STRING, description: 'The name of the product (for confirmation).' },
      },
      required: ['product_id'],
    },
  };

  const addToCartDeclaration = {
    name: 'add_to_cart',
    description: 'Adds a specified product to the user\'s shopping cart.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING, description: 'The unique ID of the product to add.' },
        product_name: { type: Type.STRING, description: 'The name of the product (for confirmation).' },
        quantity: { type: Type.NUMBER, description: 'The quantity to add. Defaults to 1 if not specified.' },
      },
      required: ['product_id'],
    },
  };
  
  const initiatePurchaseDeclaration = {
    name: 'initiate_purchase',
    description: 'Initiates the purchase process for a specified product, potentially by adding to cart and navigating to checkout or directly to a payment page.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        product_id: { type: Type.STRING, description: 'The unique ID of the product to purchase.' },
        product_name: { type: Type.STRING, description: 'The name of the product (for confirmation).' },
      },
      required: ['product_id'],
    },
  };

  const navigateHomeDeclaration = {
    name: 'navigate_home',
    description: 'Navigates the user to the application\'s home page (typically the root path "/").',
    parameters: { type: Type.OBJECT, properties: {} },
  };

  const navigateToContentCreationDeclaration = {
    name: 'navigate_to_content_creation_page',
    description: 'Navigates the user to the content creation page.',
    parameters: { type: Type.OBJECT, properties: {} },
  };

  const navigateToStoreDashboardDeclaration = {
    name: 'navigate_to_store_dashboard',
    description: 'Navigates the user to the store dashboard page.',
    parameters: { type: Type.OBJECT, properties: {} },
  };

  const navigateToRouteDeclaration = {
    name: 'navigate_to_route',
    description: 'Navigates the user to a specified route within the application. Use for requests like "go to a specific page". This is a generic navigation tool.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        route: {
          type: Type.STRING,
          description: 'The path to navigate to (e.g., "/", "/content-creation", "/dashboard").',
        },
      },
      required: ['route'],
    },
  };

  const toggleThemeModeDeclaration = {
    name: 'toggle_theme_mode',
    description: 'Toggles the application\'s visual theme between light and dark mode.',
    parameters: {
      type: Type.OBJECT,
      properties: {}, 
    },
  };

  const openImportStoreDialogDeclaration = {
    name: 'open_import_store_dialog',
    description: 'Opens the dialog or interface for importing a store from another platform.',
    parameters: {
      type: Type.OBJECT,
      properties: {}, 
    },
  };

  const goToCartDeclaration = {
    name: 'go_to_cart',
    description: 'Navigates the user to their shopping cart page.',
    parameters: {
      type: Type.OBJECT,
      properties: {}, 
    },
  };

  const toolFunctionDeclarations = [
    findAndOpenProductDeclaration,
    navigateToProductDetailDeclaration,
    addToCartDeclaration,
    initiatePurchaseDeclaration,
    navigateToRouteDeclaration, 
    toggleThemeModeDeclaration,
    openImportStoreDialogDeclaration,
    goToCartDeclaration,
    navigateHomeDeclaration,
    navigateToContentCreationDeclaration,
    navigateToStoreDashboardDeclaration,
  ];
  // --- End Function Declarations ---

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const addSystemMessage = (text, type = 'system') => {
    // console.log(`[SYSTEM MESSAGE - ${type.toUpperCase()}]: ${text}`); 
  };

  const toggleChatbot = () => setIsOpen(!isOpen);
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

  // --- Client-side implementations for declared functions ---
  const clientNavigateToRoute = (args) => {
    const route = args.route;
    if (route) {
      try {
        navigate(route);
        return { success: true, detail: `Successfully navigated to ${route}` };
      } catch (e) {
        console.error("Navigation error:", e);
        return { success: false, detail: `Failed to navigate: ${e.message}` };
      }
    }
    return { success: false, detail: "Route not provided in arguments." };
  };

  const clientToggleThemeMode = (args) => {
    return { success: true, detail: "Theme toggled (placeholder action)." };
  };

  const clientOpenImportStoreDialog = (args) => {
    return { success: true, detail: "Import store dialog would be shown (placeholder action)." };
  };

  const clientGoToCart = (args) => {
    try {
      navigate('/cart'); 
      return { success: true, detail: "Navigated to cart page." };
    } catch (e) {
      console.error("Navigation to cart error:", e);
      return { success: false, detail: `Failed to navigate to cart: ${e.message}` };
    }
  };

  const clientFindAndOpenProduct = (args) => {
    const productQuery = args.product_query?.toLowerCase().trim();
    if (!productQuery) {
      return { success: true, product_found: false, detail: "Product query not provided." };
    }

    if (!currentStore || !currentStore.products || currentStore.products.length === 0) {
      return { success: true, product_found: false, detail: "No products available in the current store to search." };
    }

    const products = currentStore.products;
    let foundProduct = null;

    foundProduct = products.find(p => p.name?.toLowerCase() === productQuery);

    if (!foundProduct) {
      const queryWords = productQuery.split(/\s+/).filter(w => w.length > 1);
      if (queryWords.length > 0) {
        let scoredProducts = products.map(p => {
          const productNameLower = p.name?.toLowerCase() || "";
          const productDescriptionLower = p.description?.toLowerCase() || "";
          let score = 0;

          queryWords.forEach(qw => {
            if (productNameLower.includes(qw)) score += 2;
            if (productDescriptionLower.includes(qw)) score += 1;
          });
          if (productNameLower.includes(productQuery)) score += 5;
          if (productDescriptionLower.includes(productQuery)) score += 2;
          
          return { product: p, score };
        });

        scoredProducts = scoredProducts.filter(sp => sp.score > 0)
                                     .sort((a, b) => b.score - a.score);
        if (scoredProducts.length > 0) foundProduct = scoredProducts[0].product;
      }
    }
    
    if (!foundProduct) {
        if (/^[a-zA-Z0-9-_]+$/.test(productQuery) && !productQuery.includes(" ")) { 
            foundProduct = products.find(p => p.id?.toString() === productQuery);
        }
    }

    if (foundProduct) {
      let primaryImageUrl = null;
      
      // Prefer larger images first, consistent with getActualProductImageUrl
      if (foundProduct.image?.src?.large && typeof foundProduct.image.src.large === 'string') {
        primaryImageUrl = foundProduct.image.src.large;
      } else if (foundProduct.image?.src?.medium && typeof foundProduct.image.src.medium === 'string') {
        primaryImageUrl = foundProduct.image.src.medium;
      } else if (foundProduct.image?.src?.small && typeof foundProduct.image.src.small === 'string') {
        primaryImageUrl = foundProduct.image.src.small;
      } else if (foundProduct.image_url && typeof foundProduct.image_url === 'string') { 
        primaryImageUrl = foundProduct.image_url;
      } else if (foundProduct.imageUrl && typeof foundProduct.imageUrl === 'string') { // Check direct imageUrl property
        primaryImageUrl = foundProduct.imageUrl;
      } else if (foundProduct.image && typeof foundProduct.image === 'string') { // Check if image itself is a URL string
        primaryImageUrl = foundProduct.image;
      } else if (foundProduct.images && Array.isArray(foundProduct.images) && foundProduct.images.length > 0 && foundProduct.images[0]?.src && typeof foundProduct.images[0].src === 'string') {
        primaryImageUrl = foundProduct.images[0].src;
      } else if (foundProduct.featuredImage?.url && typeof foundProduct.featuredImage.url === 'string') {
        primaryImageUrl = foundProduct.featuredImage.url;
      }
      
      // Ensure primaryImageUrl is a non-empty trimmed string or null
      if (primaryImageUrl && typeof primaryImageUrl === 'string' && primaryImageUrl.trim() !== "") {
        primaryImageUrl = primaryImageUrl.trim();
      } else {
        primaryImageUrl = null;
      }

      return { 
        success: true, 
        product_found: true, 
        product_data: {
          id: foundProduct.id,
          name: foundProduct.name,
          description: foundProduct.description || "No description available.",
          price: foundProduct.price || "Price not available.", 
          imageUrl: primaryImageUrl, 
        },
        detail: `Found product: ${foundProduct.name}` 
      };
    } else {
      return { success: true, product_found: false, detail: `Could not find a matching or relevant product for query: "${args.product_query}"` };
    }
  };

   const clientNavigateToProductDetail = (args) => {
    if (args.product_id && currentStore && currentStore.id) {
      navigate(`/store/${currentStore.id}/product/${args.product_id}`);
      return { success: true, detail: `Navigated to product page for ID ${args.product_id} in store ${currentStore.id}` };
    }
    if (!currentStore || !currentStore.id) {
      return { success: false, detail: "Current store information is not available for navigation." };
    }
    return { success: false, detail: "Product ID not provided for navigation." };
  };

  const clientAddToCart = (args) => {
    if (!currentStore || !currentStore.id) {
      return { success: false, detail: "Current store not available for cart operation." };
    }
    if (!args.product_id) {
      return { success: false, detail: "Product ID not provided to add to cart." };
    }

    const product = getProductById(currentStore.id, args.product_id);

    if (product) {
      const quantityToAdd = args.quantity || 1;
      // Add the product (or increment if already there by 1)
      contextAddToCart(product, currentStore.id); 
      
      // If a specific quantity > 1 was requested, update to that quantity.
      // This handles cases where AI wants to set a specific total quantity.
      if (quantityToAdd > 1) {
        contextUpdateQuantity(args.product_id, currentStore.id, quantityToAdd);
      }
      
      return { success: true, detail: `${args.product_name || product.name || 'Product'} added/updated in cart with quantity ${quantityToAdd}.` };
    } else {
      return { success: false, detail: `Product with ID ${args.product_id} not found.` };
    }
  };

  const clientInitiatePurchase = (args) => { // No longer async, doesn't call Stripe directly
    const { product_id, product_name } = args;

    if (!currentStore || !currentStore.id) {
      console.error("Buy Now: Current store not available.");
      return { success: false, detail: "Current store information is not available to initiate purchase." };
    }
    if (!product_id) {
      console.error("Buy Now: Product ID not provided.");
      return { success: false, detail: "Product ID not provided." };
    }

    const product = getProductById(currentStore.id, product_id);

    if (!product) {
      console.error(`Buy Now: Product with ID ${product_id} not found.`);
      return { success: false, detail: `Product with ID ${product_id} not found.` };
    }
    
    try {
      // Add product to internal cart
      contextAddToCart(product, currentStore.id); // Toast is handled by contextAddToCart

      // Navigate to the internal checkout page, passing product info in state
      navigate('/checkout', { 
        state: { 
          action: 'buyNow', 
          productToAddId: product.id, 
          // productToAddName: product.name, // Name can be fetched on checkout page using ID
          storeId: currentStore.id 
        } 
      });
      
      return { success: true, detail: `Added ${product.name || 'product'} to cart and navigated to checkout.` };
    } catch (error) {
      console.error("Error during Buy Now (add to cart & navigate) process:", error);
      return { success: false, detail: error.message || "Could not process Buy Now action." };
    }
  };
  // --- End client-side implementations ---

  // --- Handler for executing function calls and responding to Gemini ---
  const handleFunctionExecution = async (functionCall, originalAssistantMessageId) => {
    let functionExecutionResultPayload; 
    let clientFunctionSuccess = false;

    switch (functionCall.name) {
      case 'navigate_to_route':
        functionExecutionResultPayload = clientNavigateToRoute(functionCall.args);
        clientFunctionSuccess = functionExecutionResultPayload.success;
        break;
      case 'toggle_theme_mode':
        functionExecutionResultPayload = clientToggleThemeMode(functionCall.args);
        clientFunctionSuccess = functionExecutionResultPayload.success;
        break;
      case 'open_import_store_dialog':
        functionExecutionResultPayload = clientOpenImportStoreDialog(functionCall.args);
        clientFunctionSuccess = functionExecutionResultPayload.success;
        break;
      case 'go_to_cart':
        functionExecutionResultPayload = clientGoToCart(functionCall.args);
        clientFunctionSuccess = functionExecutionResultPayload.success;
        break;
      case 'navigate_home':
        functionExecutionResultPayload = clientNavigateToRoute({ route: '/' }); 
        clientFunctionSuccess = functionExecutionResultPayload.success;
        break;
      case 'navigate_to_content_creation_page':
        functionExecutionResultPayload = clientNavigateToRoute({ route: '/content-creation' }); 
        clientFunctionSuccess = functionExecutionResultPayload.success;
        break;
      case 'navigate_to_store_dashboard':
        functionExecutionResultPayload = clientNavigateToRoute({ route: '/dashboard' }); 
        clientFunctionSuccess = functionExecutionResultPayload.success;
        break;
      case 'find_and_open_product':
        functionExecutionResultPayload = clientFindAndOpenProduct(functionCall.args);
        clientFunctionSuccess = functionExecutionResultPayload.success; 
        break;
      case 'navigate_to_product_detail_page': 
        functionExecutionResultPayload = clientNavigateToProductDetail(functionCall.args); 
        clientFunctionSuccess = functionExecutionResultPayload.success; 
        break;
      case 'add_to_cart': 
        functionExecutionResultPayload = clientAddToCart(functionCall.args); 
        clientFunctionSuccess = functionExecutionResultPayload.success; 
        break;
      case 'initiate_purchase': 
        functionExecutionResultPayload = clientInitiatePurchase(functionCall.args); 
        clientFunctionSuccess = functionExecutionResultPayload.success; 
        break;
      default:
        functionExecutionResultPayload = { success: false, detail: `Error: Unknown function ${functionCall.name}` };
    }

    if (!clientFunctionSuccess) {
      console.error(`Function ${functionCall.name} execution failed: ${functionExecutionResultPayload.detail}`);
      setMessages(prev => prev.map(msg => 
          msg.id === originalAssistantMessageId ? 
          { ...msg, text: (msg.text.replace(/\(Function call: .*\)/, "").trim() + `\n(Function ${functionCall.name} failed)`).trim(), functionCallData: null } : 
          msg
      ));
      return; 
    }
    
    const functionResponseForApi = {
      message: [ 
        {
          functionResponse: { 
            name: functionCall.name,
            response: { 
              result: functionExecutionResultPayload, 
            }
          }
        }
      ]
    };

    try {
      const stream = await geminiChat.sendMessageStream(functionResponseForApi);
      let finalResponseText = "";
      
      setMessages(prev => prev.map(msg => 
          msg.id === originalAssistantMessageId ? 
          { ...msg, text: "", functionCallData: null, productCardData: null } : 
          msg
      ));

      for await (const chunk of stream) {
        if (chunk.functionCalls || chunk.functionCall) {
           console.error("Model attempted another function call immediately after a function response.");
           break; 
        }
        const chunkText = chunk.text;
        if (chunkText) {
          finalResponseText += chunkText;
          setMessages(prev =>
            prev.map(msg => {
              if (msg.id === originalAssistantMessageId) {
                const updatedMsg = { ...msg, text: finalResponseText };
                if (functionCall.name === 'find_and_open_product' && 
                    functionExecutionResultPayload.success && 
                    functionExecutionResultPayload.product_found) {
                  updatedMsg.productCardData = functionExecutionResultPayload.product_data;
                }
                return updatedMsg;
              }
              return msg;
            })
          );
        }
      }

      if (functionCall.name === 'find_and_open_product' && 
          functionExecutionResultPayload.success && 
          functionExecutionResultPayload.product_found) {
        setMessages(prev =>
          prev.map(msg => 
            msg.id === originalAssistantMessageId ? 
            { ...msg, productCardData: functionExecutionResultPayload.product_data } : 
            msg
          )
        );
      }
      
      if (finalResponseText.trim() === "") {
        if (functionCall.name === 'find_and_open_product' && functionExecutionResultPayload.product_found) {
          setMessages(prev => prev.map(msg => 
              msg.id === originalAssistantMessageId && msg.text.trim() === "" ? 
              { ...msg, text: "Here is the product information:" } : 
              msg
          ));
        } else {
           setMessages(prev => prev.map(msg => 
              msg.id === originalAssistantMessageId && msg.text.trim() === "" ? 
              { ...msg, text: "(Function processed)" } : 
              msg
          ));
        }
      }
    } catch (err) {
      console.error("Error sending function response or getting final response from Gemini:", err);
       setMessages(prev => prev.map(msg => 
          msg.id === originalAssistantMessageId ? 
          { ...msg, text: (msg.text + `\n(Error processing function result)`).trim(), functionCallData: null } : 
          msg
      ));
    }
  };
  // --- End function execution handler ---
  
  const initializeGeminiChat = async () => {
    if (geminiChat || isGeminiInitializing) return;
    setIsGeminiInitializing(true);

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
        tools: [{ functionDeclarations: toolFunctionDeclarations }],
        systemInstruction: knowledgeBase, 
      };

      const chat = genAI.chats.create({
        model: "gemini-2.0-flash", 
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

  // --- Click Handlers for Product Card Buttons ---
  const handleProductCardViewDetails = (productId, productName) => {
    // Directly navigate instead of sending a message to the AI
    clientNavigateToProductDetail({ product_id: productId });
    // Optionally, you could still send a message to the AI to inform it,
    // or add a message to the chat history from the client-side, e.g.:
    // setMessages(prev => [...prev, { id: `nav-${Date.now()}`, role: 'system', text: `Navigating to details for ${productName || `product ID ${productId}`}...` }]);
  };

  const handleProductCardAddToCart = (productId, productName) => {
    if (!currentStore || !currentStore.id) {
      console.error("Cannot add to cart: current store not available.");
      // Consider adding a user-facing toast message here if needed
      return;
    }
    const product = getProductById(currentStore.id, productId);
    if (product) {
      contextAddToCart(product, currentStore.id); // Toast is handled by contextAddToCart
    } else {
      console.error(`Product with ID ${productId} not found, cannot add to cart.`);
      // Consider adding a user-facing toast message here
    }
  };

  const handleProductCardBuyNow = async (productId, productName) => {
    // Directly call clientInitiatePurchase instead of sending a message to AI
    const result = await clientInitiatePurchase({ product_id: productId, product_name: productName });
    if (!result.success) {
      // Handle error, e.g., show a toast to the user
      console.error("Buy Now failed:", result.detail);
      // Example: useToast().toast({ title: "Purchase Failed", description: result.detail, variant: "destructive" });
      // Make sure useToast is imported and available if you use it here.
      // For now, just logging.
    }
    // If successful, redirectToCheckout will handle navigation.
  };

  const handleProductCardVisualize = (productId, productName) => {
    setVisualizingProduct({ id: productId, name: productName });
    fileInputRef.current?.click(); // Trigger file input
  };

  const getActualProductImageUrl = (productObject) => {
    if (!productObject) return null;
    let url = null;
    // Cascade similar to clientFindAndOpenProduct's image finding logic
    if (productObject.image?.src?.large && typeof productObject.image.src.large === 'string') url = productObject.image.src.large;
    else if (productObject.image?.src?.medium && typeof productObject.image.src.medium === 'string') url = productObject.image.src.medium;
    else if (productObject.image?.src?.small && typeof productObject.image.src.small === 'string') url = productObject.image.src.small;
    else if (productObject.image_url && typeof productObject.image_url === 'string') url = productObject.image_url;
    else if (productObject.imageUrl && typeof productObject.imageUrl === 'string') url = productObject.imageUrl;
    else if (productObject.image && typeof productObject.image === 'string') url = productObject.image;
    else if (productObject.images && Array.isArray(productObject.images) && productObject.images.length > 0 && productObject.images[0]?.src) url = productObject.images[0].src;
    else if (productObject.featuredImage?.url) url = productObject.featuredImage.url;
    
    if (url && typeof url === 'string' && url.trim() !== "") return url.trim();
    return null;
  };

  const handleImageFileChange = async (event) => {
    const referenceFile = event.target.files?.[0]; // This is a File object
    if (!referenceFile || !visualizingProduct) {
      setVisualizingProduct(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setMessages(prev => [...prev, { 
      id: `system-visualizing-${Date.now()}`, 
      role: 'system', 
      text: `Visualizing ${visualizingProduct.name} with your uploaded image. This may take a moment...` 
    }]);

    try {
      console.log("[ChatViz] Getting product details for ID:", visualizingProduct.id);
      const product = getProductById(currentStore.id, visualizingProduct.id);
      if (!product) {
        console.error("[ChatViz] Product not found for ID:", visualizingProduct.id);
        throw new Error("Product details not found for visualization.");
      }
      console.log("[ChatViz] Product found:", product.name);
      
      const actualProductImageUrl = getActualProductImageUrl(product);

      if (!actualProductImageUrl) { 
        console.error("[ChatViz] Product actual image URL is missing or invalid for product:", product.name, "Raw product data:", product);
        throw new Error("Product does not have a valid existing image to use for visualization context.");
      }
      console.log("[ChatViz] Actual Product imageUrl to use:", actualProductImageUrl);

      const mainProductForApi = {
        name: product.name,
        description: product.description,
        imageSource: actualProductImageUrl, // Use the validated and extracted URL
      };

      // For chat, we don't have UI for additional products or custom color, so pass defaults.
      // Custom instructions can be simple or empty.
      const customInstructions = `Visualize the product "${product.name}" in a new scene inspired by the provided reference image. Focus on a creative and appealing composition.`;
      
      console.log("[ChatViz] Calling generateProductVisualization...");
      const result = await generateProductVisualization({
        mainProduct: mainProductForApi,
        referenceSceneSource: referenceFile, // Pass the File object directly
        additionalProducts: [], // No additional products in chat UI for now
        customInstructions: customInstructions, 
      });

      console.log("[ChatViz] generateProductVisualization result:", result);

      if (result && result.imageUrl) {
        setMessages(prev => [...prev, { 
          id: `assistant-viz-${Date.now()}`, 
          role: 'assistant', 
          text: result.commentary || `Here's a new visualization for ${product.name}:`,
          imageDataUrl: result.imageUrl // This is already a data URL from generateProductVisualization
        }]);
      } else {
        console.error("[ChatViz] generateProductVisualization did not return an imageUrl. Commentary:", result?.commentary);
        throw new Error(result?.commentary || "Visualization did not return an image.");
      }

    } catch (error) {
      console.error("Error during visualization in chat:", error.name, error.message, error.stack);
      setMessages(prev => [...prev, { 
        id: `error-viz-${Date.now()}`, 
        role: 'system', 
        text: `Sorry, I couldn't visualize the product. Error: ${error.name} - ${error.message}` 
      }]);
    } finally {
      setVisualizingProduct(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    }
  };
  // --- End Click Handlers ---

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={handleImageFileChange} 
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
        <Card className="fixed bottom-[96px] right-4 w-full max-w-md h-[70vh] max-h-[600px] shadow-xl z-[1000] flex flex-col bg-background border rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
            <CardTitle className="text-md font-semibold">Gemini Assistant</CardTitle>
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
          
          {showKnowledgeBaseInput && (
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

          <CardContent className="flex-grow p-3 overflow-y-auto space-y-3">
            {messages.map((msg) => (
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
                            onViewDetails={handleProductCardViewDetails}
                            onAddToCart={handleProductCardAddToCart}
                            onBuyNow={handleProductCardBuyNow}
                            onVisualize={(msg.productCardData.imageUrl && typeof msg.productCardData.imageUrl === 'string' && msg.productCardData.imageUrl.trim() !== "") ? handleProductCardVisualize : null} 
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
                onClick={handleSendMessage} 
                size="icon" 
                title="Send Message" 
                disabled={!currentMessage.trim() || !activeService || isGeminiInitializing} 
              >
                <Send size={18} />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default RealtimeChatbot;
