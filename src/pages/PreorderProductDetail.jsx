import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { storage } from '../lib/firebaseClient'; 
import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage'; 
import StoreHeader from '../components/store/StoreHeader';
import StoreFooter from '../components/store/StoreFooter';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../components/ui/dialog';
import { fetchPexelsImages, generateImageWithGemini, generateId } from '../lib/utils';
import { editImageWithGemini, generateDifferentAnglesFromImage } from '../lib/geminiImageGeneration'; 
import { ShoppingCart, Star, ImageDown as ImageUp, Wand, Loader2, ArrowLeft, Replace, Edit3, VideoIcon, UploadCloud, Box, Layers, Trash2 as DeleteIcon } from 'lucide-react'; 
import { motion } from 'framer-motion';
import { useToast } from '../components/ui/use-toast';
import GenerateProductVideoModal from '../components/product/GenerateProductVideoModal';
import Generate3DModelModal from '../components/product/Generate3DModelModal';
import Model3DViewer from '../components/product/Model3DViewer';
import ProductVisualizer from '../components/product/ProductVisualizer';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'; 
import { Progress } from '../components/ui/progress';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PreorderProductDetail = () => {
  const stripe = useStripe();
  const elements = useElements();
  const params = useParams();
  const storeName = params.storeName;
  
  // Decode the product ID from the URL, which may contain special characters.
  const productId = decodeURIComponent(params.productId);

  const { getStoreByName, getProductById, updateProductImage, updateStore, isLoadingStores, viewMode, updateProductImagesArray } = useStore(); 
  const isPublishedView = viewMode === 'published';
  const { toast } = useToast();
  const navigate = useNavigate();
  const functions = getFunctions(); 

  const [store, setStore] = useState(null);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [currentResolvedSku, setCurrentResolvedSku] = useState(null); 
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [searchedImages, setSearchedImages] = useState([]);
  const [isImageLoading, setIsImageLoading] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageEditPrompt, setImageEditPrompt] = useState('');
  const [isEditingImage, setIsEditingImage] = useState(false);

  const [isProductVideoModalOpen, setIsProductVideoModalOpen] = useState(false);
  const [currentProductVideoUrl, setCurrentProductVideoUrl] = useState('');
  
  const [is3DModelModalOpen, setIs3DModelModalOpen] = useState(false);
  const [current3DModelUrl, setCurrent3DModelUrl] = useState('');
  const [current3DThumbnailUrl, setCurrent3DThumbnailUrl] = useState('');

  const [activeImageUrl, setActiveImageUrl] = useState('');
  const [imageGallery, setImageGallery] = useState([]);
  const [isVisualizingVariant, setIsVisualizingVariant] = useState(false);
  const [visualizationError, setVisualizationError] = useState(null);
  const [visualizedVariantThumbnailUrl, setVisualizedVariantThumbnailUrl] = useState('');
  const [originalImageForComparison, setOriginalImageForComparison] = useState(''); 
  const [isGeneratingAnglesOnDetail, setIsGeneratingAnglesOnDetail] = useState(false);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [preorders, setPreorders] = useState(0);
  const [isPreordering, setIsPreordering] = useState(false);

  const handlePreorder = async () => {
    if (!stripe || !elements) {
      toast({ title: "Stripe not loaded", description: "Please wait a moment and try again.", variant: "destructive" });
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      toast({ title: "Card details not found", description: "Please ensure your card details are entered correctly.", variant: "destructive" });
      return;
    }

    setIsPreordering(true);

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        throw new Error(error.message);
      }

      const createPreOrderPaymentIntent = httpsCallable(functions, 'createPreOrderPaymentIntent');
      const result = await createPreOrderPaymentIntent({
        productId: product.id,
        amount: (parseFloat(product.preorder_price) || 0) * 100 * quantity,
        currency: 'usd',
        paymentMethodId: paymentMethod.id,
        returnUrl: window.location.href,
      });

      const { clientSecret } = result.data;

      const { error: confirmError } = await stripe.confirmCardPayment(clientSecret);

      if (confirmError) {
        throw new Error(confirmError.message);
      }
      
      setPreorders(prev => prev + quantity);
      toast({
        title: "Pre-order Successful",
        description: `You have pre-ordered ${quantity} unit(s) of ${product.name}.`,
      });
      cardElement.clear();

    } catch (error) {
      console.error("Pre-order failed:", error);
      toast({
        title: "Pre-order Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPreordering(false);
    }
  };

  // Helper to convert data URL to Blob
  const dataURLtoBlob = (dataurl) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  }

  const handleGenerateAnglesOnDetail = async () => {
    if (!activeImageUrl || !product || !store) {
      toast({ title: "Missing data", description: "Cannot generate angles without an active image, product, or store context.", variant: "destructive" });
      return;
    }
    setIsGeneratingAnglesOnDetail(true);
    try {
      const { base64ImageData, mimeType } = await convertImageSrcToBasics(activeImageUrl);
      const newAngleImageUrls = await generateDifferentAnglesFromImage(base64ImageData, mimeType, product.name || "Product");

      if (newAngleImageUrls && newAngleImageUrls.length > 0) {
        const uploadedAngleUrls = [];
        for (const dataUrl of newAngleImageUrls) {
          if (dataUrl.startsWith('data:')) {
            const blob = dataURLtoBlob(dataUrl);
            const imageName = `angle-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.png`;
            const storagePath = `products/${store.id}/${product.id}/angles/${imageName}`;
            const imageRef = ref(storage, storagePath);
            await uploadBytes(imageRef, blob);
            const downloadURL = await getDownloadURL(imageRef);
            uploadedAngleUrls.push(downloadURL);
          } else {
            uploadedAngleUrls.push(dataUrl); // If it's already a URL
          }
        }
        
        const newGalleryImages = uploadedAngleUrls.map((url, index) => ({
          id: `angle-${product.id}-${imageGallery.length + index}-${generateId()}`,
          src: { medium: url, large: url },
          alt: `${product.name} - Angle ${imageGallery.length + index + 1}`
        }));
        
        const updatedImageGallery = [...imageGallery, ...newGalleryImages];
        setImageGallery(updatedImageGallery);
        const allImageUrlsForProduct = updatedImageGallery.map(img => img.src.large || img.src.medium);
        await updateProductImagesArray(store.id, product.id, allImageUrlsForProduct);
        toast({ title: "Angles Generated & Stored", description: `${uploadedAngleUrls.length} new angle images added to gallery and storage.` });
      } else {
        toast({ title: "No Angles Generated", description: "The AI did not return any new angle images.", variant: "default" });
      }
    } catch (error) {
      console.error("Error generating or storing angles on detail page:", error);
      toast({ title: "Angle Generation/Storage Failed", description: error.message, variant: "destructive" });
    }
    setIsGeneratingAnglesOnDetail(false);
  };

  const handleDeleteImageFromGallery = async (imageIdToDelete) => {
    if (!store || !product) return;
    const updatedGallery = imageGallery.filter(img => img.id !== imageIdToDelete);
    if (updatedGallery.length === 0) {
      const placeholderUrl = `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(product.name || 'Product')}`;
      setImageGallery([{ id: `placeholder-${product.id}`, src: { medium: placeholderUrl, large: placeholderUrl }, alt: product.name || 'Product image' }]);
      setActiveImageUrl(placeholderUrl);
    } else {
      setImageGallery(updatedGallery);
      if (activeImageUrl === imageGallery.find(img => img.id === imageIdToDelete)?.src.large || activeImageUrl === imageGallery.find(img => img.id === imageIdToDelete)?.src.medium) {
        setActiveImageUrl(updatedGallery[0].src.large || updatedGallery[0].src.medium);
      }
    }
    const allImageUrlsForProduct = updatedGallery.map(img => img.src.large || img.src.medium).filter(url => !url.includes('via.placeholder.com'));
    await updateProductImagesArray(store.id, product.id, allImageUrlsForProduct);
    toast({ title: "Image Deleted", description: "Image removed from gallery.", variant: "destructive" });
  };

  const convertImageSrcToBasics = useCallback((imageSrc) => {
    return new Promise((resolve, reject) => {
      if (!imageSrc) {
        return reject(new Error("Image source is undefined or null."));
      }
      if (imageSrc.startsWith('data:')) {
        try {
          const parts = imageSrc.split(',');
          if (parts.length < 2) throw new Error("Invalid data URL structure.");
          const metaPart = parts[0];
          const base64Data = parts[1];
          const mimeTypeMatch = metaPart.match(/:(.*?);/);
          if (!mimeTypeMatch || !mimeTypeMatch[1]) throw new Error("Could not parse MIME type from data URL.");
          const mimeType = mimeTypeMatch[1];
          resolve({ base64ImageData: base64Data, mimeType });
        } catch (error) {
          console.error("Error parsing data URL:", imageSrc, error);
          reject(new Error(`Invalid data URL format: ${error.message}`));
        }
      } else { 
        const img = new Image();
        img.crossOrigin = 'Anonymous'; 
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          try {
            const dataUrl = canvas.toDataURL('image/png'); 
            const parts = dataUrl.split(',');
            const base64Data = parts[1];
            resolve({ base64ImageData: base64Data, mimeType: 'image/png' });
          } catch (e) {
            console.error("Canvas toDataURL failed:", e);
            reject(new Error("Canvas toDataURL failed, possibly due to CORS or tainted canvas. " + e.message));
          }
        };
        img.onerror = (e) => {
          console.error("Failed to load image from URL for conversion:", imageSrc, e);
          reject(new Error("Failed to load image from URL for conversion."));
        };
        img.src = imageSrc;
      }
    });
  }, []);

  const handleImageEditSave = useCallback(async () => {
    if (!imageEditPrompt.trim() || !activeImageUrl || !product || !store) {
      toast({ title: "Missing data", description: "Active image, edit prompt, product, or store context is missing.", variant: "destructive" });
      return;
    }
    setIsEditingImage(true);
    try {
      const { base64ImageData, mimeType } = await convertImageSrcToBasics(activeImageUrl);
      const result = await editImageWithGemini(base64ImageData, mimeType, imageEditPrompt);
      
      if (result && result.editedImageData && result.newMimeType) {
        const editedDataUrl = `data:${result.newMimeType};base64,${result.editedImageData}`;
        const blob = dataURLtoBlob(editedDataUrl);
        const imageName = `edited-${Date.now()}.png`;
        const storagePath = `products/${store.id}/${product.id}/images/${imageName}`;
        const imageRef = ref(storage, storagePath);
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);

        const newImageObject = {
          id: generateId(), 
          src: { medium: downloadURL, large: downloadURL }, 
          alt: `${product.name} (edited: ${imageEditPrompt.substring(0,20)}...)`, 
          photographer: "Edited with Gemini AI via Firebase Storage" 
        };
        
        await updateProductImage(store.id, productId, newImageObject); 
        
        const updatedGallery = imageGallery.map(img => 
          (img.src.medium === activeImageUrl || img.src.large === activeImageUrl) ? newImageObject : img
        );
        if (!imageGallery.some(img => img.src.medium === activeImageUrl || img.src.large === activeImageUrl)) {
            updatedGallery.push(newImageObject);
        }
        setImageGallery(updatedGallery);
        setActiveImageUrl(downloadURL);

        toast({ title: "Image Edited & Stored", description: "Product image updated and saved to storage." });
        setIsEditModalOpen(false);
        setImageEditPrompt('');
      } else {
        throw new Error("AI did not return valid edited image data.");
      }
    } catch (error) {
      console.error("Error editing image or uploading to storage:", error);
      toast({ title: "Image Edit Failed", description: error.message, variant: "destructive" });
    }
    setIsEditingImage(false);
  }, [activeImageUrl, imageEditPrompt, product, store, productId, updateProductImage, imageGallery, toast, convertImageSrcToBasics, dataURLtoBlob]);


  useEffect(() => {
    if (isLoadingStores) {
      return;
    }
    const currentStore = getStoreByName(storeName); 
    if (currentStore) {
      setStore(currentStore);
      const currentProduct = getProductById(currentStore.id, productId); 
        if (currentProduct) {
          setProduct(currentProduct);
          setImageSearchQuery(currentProduct.name); 
          setCurrentProductVideoUrl(currentProduct.video_url || '');
        setCurrent3DModelUrl(currentProduct.model_3d_url || '');
        setCurrent3DThumbnailUrl(currentProduct.model_3d_thumbnail_url || '');
        
        let gallerySource = [];
        if (currentProduct.images && Array.isArray(currentProduct.images) && currentProduct.images.length > 0) {
          gallerySource = currentProduct.images.map((imgUrl, index) => ({
            id: `gallery-img-${currentProduct.id}-${index}-${generateId()}`,
            src: { medium: imgUrl, large: imgUrl },
            alt: `${currentProduct.name || 'Product'} image ${index + 1}`
          }));
        } else if (currentProduct.image && currentProduct.image.src) {
          gallerySource = [{
            id: currentProduct.image.id || `gallery-img-${currentProduct.id}-0-${generateId()}`,
            src: currentProduct.image.src,
            alt: currentProduct.image.alt || `${currentProduct.name || 'Product'} image`
          }];
        } else {
          gallerySource = [{
            id: `placeholder-${currentProduct.id || generateId()}`,
            src: {
              medium: `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(currentProduct.name || 'Product')}`,
              large: `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(currentProduct.name || 'Product')}`
            },
            alt: currentProduct.name || 'Product image'
          }];
        }

        if (currentProduct.video_url) {
          gallerySource.push({
            id: `video-${currentProduct.id}-${generateId()}`,
            src: { medium: currentProduct.video_url, large: currentProduct.video_url },
            alt: `${currentProduct.name} video`,
            type: 'video',
          });
        }
        setImageGallery(gallerySource);
        setActiveImageUrl(gallerySource[0]?.src?.large || gallerySource[0]?.src?.medium || '');
        
        let variantDefinitions = [];
        if (currentProduct.options && Array.isArray(currentProduct.options)) { 
          variantDefinitions = currentProduct.options;
        } else if (currentProduct.variants && Array.isArray(currentProduct.variants)) {
          if (currentProduct.variants.length > 0 && currentProduct.variants[0].name && currentProduct.variants[0].values) {
            variantDefinitions = currentProduct.variants;
          }
        }
        if (variantDefinitions.length > 0) {
          const initialSelections = {};
          variantDefinitions.forEach(variant => {
            if (variant.values && variant.values.length > 0) {
              initialSelections[variant.name] = variant.values[0];
            }
          });
          setSelectedVariants(initialSelections);
        }
      } else {
        toast({ title: "Product not found", description: `Product ID ${productId} not found in store ${currentStore.name}.`, variant: "destructive" });
        navigate(`/${storeName}`); 
      }
    } else {
      toast({ title: "Store not found", description: `Could not find store: ${storeName}`, variant: "destructive" });
      navigate('/'); 
    }
  }, [storeName, productId, getStoreByName, getProductById, navigate, toast, isLoadingStores]);

  useEffect(() => {
    if (product && Object.keys(selectedVariants).length > 0) {
      if (product.variants?.edges?.length > 0) {
        const matchedSkuNode = product.variants.edges.find(edge => {
          if (!edge.node || !edge.node.selectedOptions) return false;
          return edge.node.selectedOptions.every(option => {
            return selectedVariants[option.name] === option.value;
          });
        })?.node;
        if (matchedSkuNode) {
          setCurrentResolvedSku(matchedSkuNode);
          return;
        }
      }
    } else if (product) {
      if (product.variants?.edges?.length > 0 && !Object.keys(selectedVariants).length) {
      } else {
      }
    }
  }, [product, selectedVariants]);

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value);
    if (val > 0) setQuantity(val);
  };

  const handleProceedToCheckout = async () => {
    if (!store || !product || !displayImageUrl || displayPrice === undefined || !displayCurrencyCode) {
      toast({ title: "Error", description: "Product or store data is incomplete for checkout.", variant: "destructive" });
      return;
    }
    if (!store.merchant_id) {
      console.error("Store merchant_id is missing.", store);
      toast({ title: "Error", description: "Store owner information is missing.", variant: "destructive" });
      return;
    }
    setIsCreatingCheckout(true);
    try {
      const galleryImageUrls = imageGallery
        .map(img => img.src.large || img.src.medium)
        .filter(url => url && !url.includes('via.placeholder.com') && !url.startsWith('data:'))
        .slice(0, 8);
      
      const createProductCheckoutSession = httpsCallable(functions, 'createProductCheckoutSession');
      const result = await createProductCheckoutSession({
        productName: product.name,
        productDescription: product.description,
        productImage: displayImageUrl,
        amount: displayPrice * 100, // amount in cents
        currency: displayCurrencyCode.toLowerCase(),
        storeOwnerId: store.merchant_id,
      });

      const data = result.data;
      if (data && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session.');
      }
    } catch (error) {
      console.error("Error creating Stripe Payment Link or redirecting:", error);
      toast({ title: "Checkout Setup Failed", description: error.message || "Could not prepare for checkout.", variant: "destructive" });
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handlePexelsSearch = async () => {
    if (!imageSearchQuery.trim()) return;
    setIsImageLoading(true);
    try {
      const images = await fetchPexelsImages(imageSearchQuery, 5, 'square');
      setSearchedImages(images); 
    } catch (error) {
      toast({ title: "Image search failed", description: error.message, variant: "destructive" });
    }
    setIsImageLoading(false);
  };
  
  const handleGeminiGenerate = async () => {
    if (!imageSearchQuery.trim() || !store || !product) {
        toast({ title: "Missing context", description: "Store or product context is missing for image generation.", variant: "destructive" });
        return;
    }
    setIsImageLoading(true);
    try {
      const geminiPrompt = `Product image for: ${imageSearchQuery}, ${product?.type || store?.type || 'item'}`;
      const generatedImage = await generateImageWithGemini(geminiPrompt); 
      if (!generatedImage || !generatedImage.url || !generatedImage.url.startsWith('data:')) {
        throw new Error("AI did not return a valid base64 image data URL.");
      }
      const imageName = `gemini-${Date.now()}.png`;
      const storagePath = `products/${store.id}/${product.id}/images/${imageName}`;
      const imageRef = ref(storage, storagePath);
      const fetchRes = await fetch(generatedImage.url);
      const blob = await fetchRes.blob();
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      const newImageForSelection = { 
        id: Date.now().toString(), 
        src: { medium: downloadURL, large: downloadURL }, 
        alt: generatedImage.alt || imageSearchQuery, 
        photographer: "Gemini AI via Firebase Storage" 
      };
      setSearchedImages(prev => [newImageForSelection, ...prev.slice(0,4)]);
      toast({title: "Image Generated & Stored", description: "Gemini AI generated an image, and it has been uploaded to storage."});
    } catch (error) {
      console.error("Gemini image generation or storage upload failed:", error);
      toast({ title: "Gemini Process Failed", description: error.message, variant: "destructive" });
    }
    setIsImageLoading(false);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && store && product) {
      setIsImageLoading(true);
      const imageName = `uploaded-${Date.now()}-${file.name}`;
      const storagePath = `products/${store.id}/${product.id}/images/${imageName}`;
      const imageRef = ref(storage, storagePath);
      uploadBytes(imageRef, file)
        .then(() => getDownloadURL(imageRef))
        .then(downloadURL => {
          const newImageForSelection = {
            id: generateId(),
            src: { medium: downloadURL, large: downloadURL },
            alt: file.name,
            photographer: "Uploaded by user via Firebase Storage"
          };
          setSearchedImages(prev => [newImageForSelection, ...prev.slice(0,4)]);
          toast({ title: "Image Uploaded & Stored", description: `${file.name} uploaded. Select it from the results to use.` });
        })
        .catch(uploadError => {
          console.error("Error uploading image to Firebase Storage:", uploadError);
          toast({ title: "Storage Upload Failed", description: uploadError.message, variant: "destructive" });
        })
        .finally(() => {
          setIsImageLoading(false);
        });
    } else if (!file) {
      // No file selected
    } else {
      toast({ title: "Missing context", description: "Store or product context is missing for image upload.", variant: "destructive" });
      setIsImageLoading(false); 
    }
  };

  const handleProductVideoGenerated = async (newVideoUrl) => {
    if (!store || !product) return;
    
    const videoObject = {
      id: `video-${product.id}-${generateId()}`,
      src: { medium: newVideoUrl, large: newVideoUrl },
      alt: `${product.name} video`,
      type: 'video',
    };

    const updatedGallery = [...imageGallery, videoObject];
    setImageGallery(updatedGallery);

    const allImageUrlsForProduct = updatedGallery
      .filter(item => item.type !== 'video')
      .map(img => img.src.large || img.src.medium);

    const updatedProducts = store.products.map(p =>
      p.id === productId ? { ...p, video_url: newVideoUrl, images: allImageUrlsForProduct } : p
    );

    try {
      if (store && store.id) {
        await updateStore(store.id, { products: updatedProducts });
        setCurrentProductVideoUrl(newVideoUrl);
        toast({ title: "Product Video Generated", description: "The video has been added to the product gallery." });
      } else {
        toast({ title: "Error", description: "Store ID not available for video update.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update store with product video:", error);
      toast({ title: "Update Failed", description: "Could not save the product video.", variant: "destructive" });
    }
  };

  const handle3DModelGenerated = async (modelUrl) => {
    if (!store || !product) return;
    const updatedProducts = store.products.map(p =>
      p.id === productId ? { 
        ...p, 
        model_3d_url: modelUrl,
        model_3d_thumbnail_url: modelUrl 
      } : p
    );
    try {
      if (store && store.id) {
        await updateStore(store.id, { products: updatedProducts });
        setCurrent3DModelUrl(modelUrl);
        setCurrent3DThumbnailUrl(modelUrl);
        toast({ title: "3D Model Generated", description: "The 3D model has been added to the product." });
      } else {
        toast({ title: "Error", description: "Store ID not available for 3D model update.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update store with 3D model:", error);
      toast({ title: "Update Failed", description: "Could not save the 3D model.", variant: "destructive" });
    }
  };

  const selectImage = (selectedImg) => {
    if (store && store.id && product && selectedImg && selectedImg.src && (selectedImg.src.medium || selectedImg.src.large)) {
      const imageUrlToSave = selectedImg.src.large || selectedImg.src.medium;
      if (imageUrlToSave.startsWith('https://firebasestorage.googleapis.com') || imageUrlToSave.startsWith('http://localhost:') || imageUrlToSave.startsWith('https://images.pexels.com')) { // Allow Pexels URLs too
        const newImageObject = {
            id: selectedImg.id || generateId(),
            src: { medium: imageUrlToSave, large: imageUrlToSave }, 
            alt: selectedImg.alt || product.name,
            photographer: selectedImg.photographer || "User"
        };
        updateProductImage(store.id, productId, newImageObject); 
        
        const existingInGallery = imageGallery.find(img => (img.src.medium === imageUrlToSave || img.src.large === imageUrlToSave));
        if (!existingInGallery) {
            const newGalleryEntry = { ...newImageObject, id: newImageObject.id || generateId() };
            setImageGallery(prev => {
                const filtered = prev.filter(pImg => !pImg.src.medium.includes('via.placeholder.com'));
                return [newGalleryEntry, ...filtered.filter(pImg => pImg.src.medium !== imageUrlToSave)];
            });
        }
        setActiveImageUrl(imageUrlToSave);
        toast({ title: "Image Selected", description: "Product image updated." });

      } else {
         toast({ title: "Invalid Image URL", description: "Selected image does not have a valid storage or Pexels URL.", variant: "destructive" });
      }
    } else {
      toast({ title: "Error", description: "Cannot select image. Store, product, or image data missing.", variant: "destructive" });
    }
    setIsImageModalOpen(false);
    setSearchedImages([]);
  };

  if (isLoadingStores || !store || !product) { 
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  const currentActiveGalleryImage = imageGallery.find(img => img.src.large === activeImageUrl || img.src.medium === activeImageUrl);
  const displayImageUrl = activeImageUrl || product.image?.src?.large || product.image?.src?.medium || `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(product.name)}`;
  const displayImageAlt = currentActiveGalleryImage?.alt || product.image?.alt || product.name;
  const displayPrice = currentResolvedSku?.price?.amount !== undefined ? parseFloat(currentResolvedSku.price.amount) : product.price;
  const displayCurrencyCode = currentResolvedSku?.price?.currencyCode || product.currencyCode || 'USD';
  
  const productStock = 10;
  
  const themePrimaryColor = store?.theme?.primaryColor || '#000000';

  let displayableVariants = [];
  if (product) {
    if (product.options && Array.isArray(product.options)) { 
      displayableVariants = product.options.map(opt => ({ ...opt, name: opt.name, values: opt.values }));
    } else if (product.variants && Array.isArray(product.variants)) {
      if (product.variants.length > 0 && product.variants[0].name && product.variants[0].values) {
        displayableVariants = product.variants.map(v => ({ ...v, name: v.name, values: v.values }));
      }
    }
  }

  const handleVisualizeVariant = async () => {
    if (!product || !activeImageUrl || Object.keys(selectedVariants).length === 0) {
      toast({ title: "Cannot Visualize", description: "Product data, main image, or selected variants missing.", variant: "destructive" });
      return;
    }
    setIsVisualizingVariant(true);
    setVisualizationError(null);
    setOriginalImageForComparison(activeImageUrl); 
    try {
      const { base64ImageData, mimeType } = await convertImageSrcToBasics(activeImageUrl);
      let promptParts = [];
      for (const key in selectedVariants) {
        promptParts.push(`${key}: ${selectedVariants[key]}`);
      }
      const variantDescription = promptParts.join(', ');
      const visualizationPrompt = `Visualize the product "${product.name}" with the following attributes: ${variantDescription}. Apply these changes to the provided image.`;
      const result = await editImageWithGemini(base64ImageData, mimeType, visualizationPrompt);
      if (result && result.editedImageData && result.newMimeType && typeof result.newMimeType === 'string' && result.newMimeType.includes('/')) {
        const newImageDataUrl = `data:${result.newMimeType};base64,${result.editedImageData}`;
        const newImageObject = {
          id: `visualized-${generateId()}`,
          src: { medium: newImageDataUrl, large: newImageDataUrl },
          alt: `${product.name} visualized with ${variantDescription}`,
          photographer: "Variant Visualization by Gemini AI"
        };
        setImageGallery(prevGallery => [newImageObject, ...prevGallery]);
        setVisualizedVariantThumbnailUrl(newImageObject.src.medium || newImageObject.src.large); 
        toast({ title: "Variant Visualized", description: "Comparison slider generated below." });
      } else {
        let errorMsg = "AI image generation failed: ";
        if (!result) errorMsg += "No result from AI.";
        else if (!result.editedImageData) errorMsg += "Missing image data from AI.";
        else if (!result.newMimeType) errorMsg += "Missing MIME type from AI.";
        else errorMsg += `Invalid MIME type from AI ('${result.newMimeType}').`;
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("Error visualizing variant:", error);
      setVisualizationError(error.message);
      toast({ title: "Visualization Failed", description: error.message, variant: "destructive" });
    }
    setIsVisualizingVariant(false);
  };

  let daysLeft = 0;
  if (product?.duration && product?.created_at) {
    const startDate = product.created_at?.seconds ? new Date(product.created_at.seconds * 1000) : new Date(product.created_at);
    if (!isNaN(startDate.getTime())) {
      const endDate = new Date(startDate.getTime() + parseInt(product.duration, 10) * 24 * 60 * 60 * 1000);
      const now = new Date();
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      daysLeft = Math.max(0, diffDays);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StoreHeader store={store} isPublishedView={isPublishedView} productName={product.name} />
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 md:py-12 flex-grow"
      >
        <Button variant="outline" onClick={() => navigate(`/${storeName}`)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
        </Button>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center" 
          >
            <div className="relative group w-full">
              {activeImageUrl && imageGallery.find(item => (item.src.large === activeImageUrl || item.src.medium === activeImageUrl) && item.type === 'video') ? (
                <video
                  key={activeImageUrl}
                  src={activeImageUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-auto aspect-square object-cover rounded-xl shadow-lg border"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <img
                  key={activeImageUrl}
                  src={displayImageUrl}
                  alt={displayImageAlt}
                  className="w-full h-auto aspect-square object-cover rounded-xl shadow-lg border"
                />
              )}
              {!isPublishedView && (
                <>
                  <Button 
                    variant="secondary" 
                    onClick={() => setIsImageModalOpen(true)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md"
                  >
                    <Replace className="mr-2 h-4 w-4" /> Change Image
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingProduct(product);
                      setIsEditModalOpen(true);
                    }}
                    className="absolute top-16 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md"
                  >
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Product
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsProductVideoModalOpen(true)}
                    className="absolute top-28 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md"
                  >
                    <VideoIcon className="mr-2 h-4 w-4" /> Gen Video
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIs3DModelModalOpen(true)}
                    className="absolute top-40 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md"
                  >
                    <Box className="mr-2 h-4 w-4" /> Gen 3D
                  </Button>
                </>
              )}
            </div> 

            {imageGallery.length > 0 && ( 
              <motion.div 
                className="mt-4" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                  {imageGallery.map((img, index) => (
                    <motion.div
                      key={img.id || `gallery-${index}`}
                      className="relative group" 
                      whileHover={{ scale: 1.05 }}
                    >
                      <div
                        className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all hover:opacity-80
                                    ${(img.src.large === activeImageUrl || img.src.medium === activeImageUrl) ? 'border-primary shadow-sm' : 'border-transparent'}`}
                        onClick={() => setActiveImageUrl(img.src.large || img.src.medium)}
                      >
                        {img.type === 'video' ? (
                          <div className="relative w-full h-full">
                            <video
                              src={img.src.medium || img.src.large}
                              className="w-full h-full object-cover"
                              poster={product.image?.src?.medium || `https://via.placeholder.com/600x600.png?text=${encodeURIComponent(product.name)}`}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                              <VideoIcon className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={img.src.medium || img.src.large}
                            alt={img.alt || `Product image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      {!isPublishedView && imageGallery.length > 1 && !img.src.medium.includes('via.placeholder.com') && ( 
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          onClick={(e) => { e.stopPropagation(); handleDeleteImageFromGallery(img.id); }}
                          aria-label="Delete image"
                        >
                          <DeleteIcon className="h-3 w-3" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
                {!isPublishedView && activeImageUrl && !activeImageUrl.includes('via.placeholder.com') && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full" 
                    onClick={handleGenerateAnglesOnDetail}
                    disabled={isGeneratingAnglesOnDetail}
                  >
                    {isGeneratingAnglesOnDetail ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Layers className="mr-2 h-4 w-4" />}
                    Generate More Angles from Active Image
                  </Button>
                )}
              </motion.div>
            )}
          </motion.div> 
  

  <motion.div 
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="space-y-6"
  >
    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground">{product.name}</h1>
    
    <div className="flex items-center space-x-2">
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">({product.rating} reviews)</span>
      <Separator orientation="vertical" className="h-5"/>
      {/* Updated Stock Badge to use productStock and show count */}
      <Badge variant="outline" style={{borderColor: store.theme.primaryColor, color: store.theme.primaryColor}}>
        {productStock > 0 ? "Pre Order" : "Out of Stock"}
      </Badge>
    </div>

    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Progress</h2>
      <Progress value={(preorders / (product.inventory || 1)) * 100} className="w-full" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{preorders} pre-ordered</span>
        <span>{product.inventory || 0} goal</span>
      </div>
      {product.duration && (
        <div>
          <div className="text-sm text-muted-foreground">
            {daysLeft} days left
          </div>
          <p className="text-xs text-muted-foreground mt-1">This product will go into production once the goal is reached</p>
        </div>
      )}
    </div>

    {displayableVariants.length > 0 && (
      <div className="space-y-4 pt-4"> 
        {displayableVariants.map((variant) => (
          <div key={variant.name}>
            <Label className="text-sm font-medium text-foreground">
              {variant.name}: 
              <span className="text-muted-foreground font-normal ml-1">
                {selectedVariants[variant.name] || ""}
              </span>
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {variant.values.map((value) => (
                <Button
                  key={value}
                  variant={selectedVariants[variant.name] === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelectedVariants(prev => ({ ...prev, [variant.name]: value }));
                  }}
                  style={
                    selectedVariants[variant.name] === value
                      ? { backgroundColor: themePrimaryColor, color: 'white', borderColor: themePrimaryColor }
                      : { 
                          borderColor: (store.theme.secondaryColor || '#cccccc'), 
                          color: (store.theme.secondaryColor || '#333333')
                        }
                  }
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        ))}
        {displayableVariants.length > 0 && Object.keys(selectedVariants).length > 0 && (
          <div className="mt-4 w-full">
            {visualizedVariantThumbnailUrl && originalImageForComparison && (
              <div className="mb-3 flex justify-center">
                <ReactCompareSlider
                  itemOne={<ReactCompareSliderImage src={originalImageForComparison} alt="Original Image" />}
                  itemTwo={<ReactCompareSliderImage src={visualizedVariantThumbnailUrl} alt="Visualized Variant" />}
                  className="w-full max-w-md h-auto aspect-square rounded-md border shadow-md" 
                />
              </div>
            )}
            <Button 
              onClick={handleVisualizeVariant} 
              disabled={isVisualizingVariant}
              className="w-full"
              variant="outline"
            >
              {isVisualizingVariant ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand className="mr-2 h-4 w-4" />}
              Visualize Variant
            </Button>
            {visualizationError && <p className="text-red-500 text-xs mt-2">{visualizationError}</p>}
          </div>
        )}
      </div>
    )}
    
    <div className="prose prose-sm sm:prose dark:prose-invert max-w-none text-muted-foreground pt-4"> 
      <p>{product.description}</p>
    </div>

    {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4"> 
            {product.tags.map(tag => (
                <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
        </div>
    )}
    
    <Separator className="my-6" /> 
    
    <div className="space-y-4 pt-4">
      <h3 className="text-lg font-semibold text-center mb-2">Bring {product.name} to reality</h3>
      <div className="p-4 border rounded-md">
        <Label htmlFor="card-element">Card Details</Label>
        <CardElement id="card-element" className="mt-2 p-2 border rounded" />
      </div>
      <div className="flex items-end gap-4">
        <div className="space-y-1">
          <Label htmlFor="quantity" className="text-sm">Quantity</Label>
          <Input 
            id="quantity" 
            type="number" 
            value={quantity} 
            onChange={handleQuantityChange} 
            min="1" 
            max={product.inventory - preorders}
            className="w-20 h-10 text-center" 
            disabled={product.inventory <= preorders || isPreordering}
          />
        </div>
        <Button 
          size="lg" 
          onClick={handlePreorder} 
          className="flex-1 h-10"
          style={{ backgroundColor: themePrimaryColor, color: 'white' }}
          disabled={product.inventory <= preorders || isPreordering}
        >
          {isPreordering ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
          {product.inventory <= preorders ? "Goal Reached" : `Pre-order Now for $${((parseFloat(product.preorder_price) || 0) * quantity).toFixed(2)}`}
        </Button>
      </div>
      <div className="text-xs text-muted-foreground text-center mt-2">
        <p>This is a pre-authorization.</p>
        <p>You will not be charged unless the product reaches it’s goal.</p>
      </div>
    </div>
          </motion.div>
        </div>

        {current3DModelUrl && (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-3 text-foreground">3D Model</h3>
            <Model3DViewer 
              modelUrl={current3DModelUrl}
              thumbnailUrl={current3DThumbnailUrl}
              productName={product.name}
              height="500px"
              className="w-full"
            />
          </motion.div>
        )}

        {product && store && store.id && ( 
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <ProductVisualizer product={product} storeId={store.id} isPublishedView={isPublishedView} />
          </motion.div>
        )}
      </motion.main>
      <StoreFooter store={store} isPublishedView={isPublishedView} />

      {!isPublishedView && (
        <>
          <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Change Product Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Search Pexels or describe for AI..." 
                    value={imageSearchQuery}
                    onChange={(e) => setImageSearchQuery(e.target.value)}
                  />
                  <Button onClick={handlePexelsSearch} disabled={isImageLoading || !imageSearchQuery.trim()}>
                    {isImageLoading && searchedImages.length === 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />} <span className="ml-2 hidden sm:inline">Pexels</span>
                  </Button>
                  <Button onClick={handleGeminiGenerate} variant="outline" disabled={isImageLoading || !imageSearchQuery.trim()}>
                     {isImageLoading && searchedImages.length > 0 ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand className="h-4 w-4" />} <span className="ml-2 hidden sm:inline">Gemini</span>
                  </Button>
                  <Button variant="outline" onClick={() => document.getElementById('upload-image-input')?.click()} disabled={isImageLoading}>
                    <UploadCloud className="h-4 w-4" /> <span className="ml-2 hidden sm:inline">Upload</span>
                  </Button>
                  <Input 
                    type="file" 
                    id="upload-image-input" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                  />
                </div>
                {isImageLoading && searchedImages.length === 0 && <p className="text-center text-sm text-muted-foreground">Searching for images or processing upload...</p>}
                {searchedImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                    {searchedImages.map(img => (
                      <motion.div 
                        key={img.id} 
                        className="relative aspect-square rounded-md overflow-hidden cursor-pointer group border-2 border-transparent hover:border-primary transition-all"
                        onClick={() => selectImage(img)}
                        whileHover={{scale: 1.05}}
                        initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}}
                      >
                        <img src={img.src.medium} alt={img.alt || 'Search result'} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-white"/>
                        </div>
                        <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 truncate">
                          {img.photographer || img.alt}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {editingProduct && (
            <ProductEditModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              product={editingProduct}
              onSave={async (updatedProduct) => {
                if (!store || !product) return;
                const updatedProducts = store.products.map(p =>
                  p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p
                );
                await updateStore(store.id, { products: updatedProducts });
                setProduct(updatedProduct);
                toast({ title: "Product Updated", description: "Your product has been successfully updated." });
              }}
              storeId={store.id}
            />
          )}

          {product && (
            <GenerateProductVideoModal
              open={isProductVideoModalOpen}
              onOpenChange={setIsProductVideoModalOpen}
              product={product}
              onVideoGenerated={handleProductVideoGenerated}
            />
          )}
          {product && (
            <Generate3DModelModal
              open={is3DModelModalOpen}
              onOpenChange={setIs3DModelModalOpen}
              product={product}
              onModelGenerated={handle3DModelGenerated}
              storeId={store?.id}
            />
          )}
        </>
      )}
    </div>
  );
};

const CheckCircle = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default PreorderProductDetail;
