import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { startChat, continueChat } from '../lib/geminiPageGeneration';
import { useAuth } from '../contexts/AuthContext';
import { savePage, db, functions } from '../lib/firebaseClient';
import { httpsCallable } from 'firebase/functions';
import { onSnapshot, doc } from 'firebase/firestore';
import StoreSelectionModal from '../components/StoreSelectionModal';
import ContentUploadModal from '../components/ContentUploadModal';
import ImageSelectionModal from '../components/ImageSelectionModal';
import { canDeductCredits, deductCredits } from '../lib/credits';
import CreditCostsModal from '../components/CreditCostsModal';

const PageGenerator = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [editingImageSrc, setEditingImageSrc] = useState(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedPrimaryColor, setGeneratedPrimaryColor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingLinks, setIsCreatingLinks] = useState(false);
  const [isSelectingStore, setIsSelectingStore] = useState(false);
  const [thinkingText, setThinkingText] = useState('');
  const [displayedThinkingText, setDisplayedThinkingText] = useState('');
  const [chat, setChat] = useState(null);
  const [history, setHistory] = useState([]);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [credits, setCredits] = useState(0);
  const previewRef = useRef(null);
  const iframeRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (user) {
      const creditsRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(creditsRef, (doc) => {
        if (doc.exists()) {
          setCredits(doc.data().credits);
        } else {
          setCredits(0);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedThinkingText]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'edit-image') {
        setEditingImageSrc(event.data.src);
        setIsImageModalOpen(true);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    const newText = thinkingText.substring(displayedThinkingText.length);
    if (newText) {
      let i = 0;
      const interval = setInterval(() => {
        if (i < newText.length) {
          setDisplayedThinkingText((prev) => prev + newText[i]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 5); // Even faster typewriter effect
      return () => clearInterval(interval);
    }
  }, [thinkingText]);

  const handleGenerate = async () => {
    if (!prompt) {
      alert('Please enter a prompt.');
      return;
    }

    if (user) {
      const hasEnoughCredits = await canDeductCredits(user.uid, 25);
      if (!hasEnoughCredits) {
        setIsCreditModalOpen(true);
        return;
      }
    } else {
        alert("You must be logged in to generate a page.");
        return;
    }

    setIsLoading(true);
    setThinkingText('');
    setDisplayedThinkingText('');
    setGeneratedCode(''); // Clear previous result to show thinking text
    setHistory((prev) => [...prev, { role: 'user', parts: [{ text: prompt }] }]);

    try {
      if (user) {
        await deductCredits(user.uid, 25);
      }
      let currentChat = chat;
      if (!currentChat) {
        currentChat = startChat();
        setChat(currentChat);
      }

      const stream = continueChat(currentChat, prompt);
      let initialCode = '';
      for await (const result of stream) {
        if (result.type === 'thought') {
          setThinkingText((prev) => prev + result.content);
        } else if (result.type === 'result') {
          initialCode = result.content.htmlContent;
          setGeneratedCode(initialCode);
          setGeneratedTitle(result.content.title);
          setGeneratedPrimaryColor(result.content.primaryColor);
          setPreviewUrl(`https://www.freshfront.co/${result.content.title.toLowerCase().replace(/ /g, '-')}`);
          setThinkingText('');
          setHistory((prev) => [...prev, { role: 'model', parts: [{ text: initialCode }] }]);
        }
      }

      // Trigger silent improvement
      console.log('Initial code for improvement:', initialCode);
      const improvementPrompt = `Greatly improve and enhance this HTML code with advanced multi-step planning and execution: ${initialCode}. Make sure all buttons and links are functional and interactive. For example, navigation links should scroll to the correct section of the page, and buttons should have some hover effect or other interaction. When header links are clicked, they should scroll to the relevant section anchors. Do not leave any dead links.`;
      console.log('Improvement prompt:', improvementPrompt);
      const improvementStream = continueChat(currentChat, improvementPrompt);
      for await (const result of improvementStream) {
        if (result.type === 'result') {
          console.log('Improved code:', result.content.htmlContent);
          setGeneratedCode(result.content.htmlContent);
        }
      }

    } catch (error) {
      console.error('Error generating page:', error);
      alert('Failed to generate page. Please check the console for details.');
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
  };

  const handleSave = async () => {
    if (!generatedCode) {
      alert('No page to save.');
      return;
    }
    if (!user) {
      alert('You must be logged in to save a page.');
      return;
    }
    if (!generatedTitle || !generatedPrimaryColor) {
      alert('Page generation is not complete. Please wait for a title and color to be generated.');
      return;
    }

    setIsSaving(true);
    try {
      await savePage(user.uid, generatedCode, generatedTitle, generatedPrimaryColor);
      alert('Page saved successfully!');
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Failed to save page. Please check the console for details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectStore = async (store) => {
    const createPaymentLinkForProduct = httpsCallable(functions, 'createPaymentLinkForProduct');
    setIsSelectingStore(true);
    const updatedProducts = [];

    try {
      for (const product of store.products) {
        const result = await createPaymentLinkForProduct({
          productName: product.name,
          productDescription: product.description,
          productImage: product.images && product.images.length > 0 ? product.images[0] : '',
          amount: product.price * 100, // Convert to cents
          currency: 'usd',
          storeId: store.id,
          productId: product.id,
        });
        updatedProducts.push({ ...product, paymentLink: result.data.url });
      }
      alert('Payment links created for all products!');
    } catch (error) {
      console.error('Error creating payment links:', error);
      alert('Failed to create payment links. Please check the console for details.');
    } finally {
      setIsSelectingStore(false);
    }

    const productDetails = updatedProducts.map(p => 
      `Product: ${p.name}, Price: ${p.price}, Description: ${p.description}, Image URL: ${p.images && p.images.length > 0 ? p.images[0] : 'No Image'}, Payment Link: ${p.paymentLink}`
    ).join('\n');

    const collectionDetails = store.collections.map(c => 
      `Collection: ${c.name}, Description: ${c.description}`
    ).join('\n');

    const storeData = `
      Here is the data for an online store. Please generate a complete, modern, and visually appealing e-commerce website page based on this data.

      Store Name: ${store.name}
      Store Description: ${store.description}
      
      Collections:
      ${collectionDetails}

      Products:
      ${productDetails}

      Use the provided product and collection details to create relevant sections on the homepage. The design should be professional and tailored to the store's offerings. For each product, include a "Buy Now" button that navigates to the provided payment link. Make sure the link opens in a new tab by using the target="_blank" attribute on the anchor tag.
    `;
    setPrompt(storeData);
    setIsStoreModalOpen(false);
  };

  const handleContentSelect = (links) => {
    const contentLinks = links.map(link => `- ${link}`).join('\n');
    const contentPrompt = `
      Please incorporate the following content into the website. These are links to images or other assets that should be used in the design.

      Content Links:
      ${contentLinks}
    `;
    setPrompt(prev => prev ? `${prev}\n\n${contentPrompt}` : contentPrompt);
    setIsContentModalOpen(false);
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = generatedCode;
    }
  };

  const handleImageSelect = (newImageSrc) => {
    const newCode = generatedCode.replace(editingImageSrc, newImageSrc);
    setGeneratedCode(newCode);
    setIsImageModalOpen(false);
    setEditingImageSrc(null);
  };

  return (
    <div className="bg-background">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <Link to="/">
            <img
              src={isDarkMode
                  ? "https://static.wixstatic.com/media/bd2e29_20f2a8a94b7e492a9d76e0b8b14e623b~mv2.png"
                  : "https://static.wixstatic.com/media/bd2e29_695f70787cc24db4891e63da7e7529b3~mv2.png"}
              alt="FreshFront Logo"
              className="h-8 w-auto mr-2"
            />
          </Link>
          <h1 className="text-2xl font-bold hidden sm:block">Pages</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button className="btn btn-outline btn-sm sm:btn-md" onClick={() => setIsStoreModalOpen(true)} disabled={isCreatingLinks}>
            {isCreatingLinks ? <span className="loading loading-spinner"></span> : 'Import Store'}
          </button>
          <button className="btn btn-outline btn-sm sm:btn-md" onClick={() => setIsContentModalOpen(true)}>
            Import Content
          </button>
          <div className="divider divider-horizontal hidden sm:flex"></div>
          <Link to="/saved-pages">
            <button className="btn btn-ghost btn-sm sm:btn-md">Collection</button>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Coins className="h-6 w-6 text-yellow-500" />
            <span className="font-bold text-lg">{credits}</span>
          </div>
        </div>
      </div>
      
      <div className="p-4" style={{ marginTop: '-3px' }}>
          <div className="bg-base-200 rounded-t-lg overflow-hidden">
            <div className="flex items-center bg-base-300 px-4 py-2">
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-grow flex justify-center items-center relative">
                <input
                  type="text"
                  value={previewUrl}
                  readOnly
                  className="bg-gray-100 dark:bg-gray-700 dark:text-black rounded-full px-4 py-1 text-sm w-1/2 text-center border border-gray-300 dark:border-gray-600 pr-10"
                />
                <button
                  className="absolute right-[26%] btn btn-ghost btn-circle"
                  onClick={handleRefresh}
                  disabled={!generatedCode}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-ghost btn-circle"
                  onClick={() => setIsMobilePreview(!isMobilePreview)}
                >
                  {isMobilePreview ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  )}
                </button>
                <button
                  className={`btn btn-ghost btn-circle ${isSaving ? 'loading' : ''}`}
                  onClick={handleSave}
                  disabled={isSaving || !generatedCode}
                >
                  {isSaving ? <span className="loading loading-spinner"></span> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                </button>
              </div>
            </div>
          </div>
          <div
            ref={previewRef}
            className={`${
              isMobilePreview ? 'w-[375px] mx-auto' : 'w-full'
            } h-screen border border-gray-300 rounded-b-lg overflow-auto transition-all duration-300 flex items-center justify-center`}
            style={!generatedCode ? {
              backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/freshfront-89dc9.firebasestorage.app/o/windows-xp-bliss-landscape-rainbow-blue-sky-5k-5333x4000-3187.jpg?alt=media&token=f32b8264-ac0c-4c39-9f3a-7c1020b3a7b8')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : {}}
          >
            {generatedCode ? (
              <iframe
                ref={iframeRef}
                className="w-full h-full"
                srcDoc={generatedCode}
                title="Generated Website Preview"
                sandbox="allow-scripts allow-modals"
                onLoad={() => {
                  const script = document.createElement('script');
                  script.innerHTML = `
                    document.addEventListener('DOMContentLoaded', () => {
                      document.querySelectorAll('img').forEach(img => {
                        const button = document.createElement('button');
                        button.innerText = 'Edit';
                        button.style.position = 'absolute';
                        button.style.top = '5px';
                        button.style.left = '5px';
                        button.style.zIndex = '1000';
                        button.onclick = (e) => {
                          e.stopPropagation();
                          window.parent.postMessage({ type: 'edit-image', src: img.src }, '*');
                        };
                        const wrapper = document.createElement('div');
                        wrapper.style.position = 'relative';
                        wrapper.style.display = 'inline-block';
                        img.parentNode.insertBefore(wrapper, img);
                        wrapper.appendChild(img);
                        wrapper.appendChild(button);
                      });
                    });
                  `;
                  iframeRef.current.contentDocument.body.appendChild(script);
                }}
              />
            ) : (
              <div className="w-5/6 h-3/4 bg-black/70 backdrop-blur-sm rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-700">
                <div className="bg-gray-800 p-2 flex items-center flex-shrink-0">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-gray-300 text-sm ml-4">bash</div>
                </div>
                <div ref={terminalRef} className="p-4 text-green-400 flex-grow overflow-y-auto font-mono text-sm">
                  <ReactMarkdown>{displayedThinkingText}</ReactMarkdown>
                  <span className="inline-block w-2 h-4 bg-green-400 animate-pulse ml-1"></span>
                </div>
              </div>
            )}
          </div>
        </div>

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <div className="max-w-3xl mx-auto backdrop-blur-lg rounded-t-lg shadow-lg p-4 border border-gray-200">
          <div className="flex items-center gap-4">
            <textarea
              className="textarea textarea-bordered w-full h-24 flex-grow bg-transparent placeholder-gray-500"
              placeholder={
                generatedCode
                  ? 'Describe what you want to edit...'
                  : 'Describe the website you want to create...'
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              className={`btn btn-primary btn-circle ${isLoading ? 'loading' : ''}`}
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <span className="text-3xl">➡️</span>
              )}
            </button>
          </div>
        </div>
      </div>
      <StoreSelectionModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onSelectStore={handleSelectStore}
        isSelectingStore={isSelectingStore}
      />
      <ImageSelectionModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageSelect={handleImageSelect}
      />
      <ContentUploadModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        onContentSelect={handleContentSelect}
      />
      <CreditCostsModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        onSubscribe={() => {
          // Handle subscription logic, e.g., redirect to a pricing page
          console.log("Redirecting to subscription page...");
        }}
      />
    </div>
  );
};

export default PageGenerator;
