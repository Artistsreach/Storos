
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Store, 
  Edit, 
  Trash2, 
  ShoppingBag, 
  Calendar,
  Pin,
  RefreshCw
} from 'lucide-react';
import { Input } from '../components/ui/input';
// import { fetchPexelsImages } from '../lib/utils.jsx'; // Commented out as it's not used and generateStoreUrl is from utils.js
import { generateStoreUrl } from '../lib/utils.js'; // Corrected path
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebaseClient';
import { doc, updateDoc } from 'firebase/firestore';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import DeleteStoreModal from './DeleteStoreModal';

const StoreCard = ({ store }) => {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { deleteStore, updateStoreTemplateVersion, getStoreRevenue, getStoreCustomers, getStoreConversionRate, getStoreSocialScore } = useStore();
  const { user } = useAuth();
  const [storeData, setStoreData] = useState(store);
  const { pinned } = storeData;
  const [revenue, setRevenue] = useState(0);
  const [socialScore, setSocialScore] = useState(0);
  const [customers, setCustomers] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);

  useEffect(() => {
    setStoreData(store);
  }, [store]);

  const isUserStore = storeData.merchant_id === user?.uid;
  const glowEffect = isUserStore && storeData.theme?.primaryColor 
    ? { boxShadow: `0 0 10px 2px ${storeData.theme.primaryColor}A0` }
    : {};


  let productImageUrl = null;
  if (storeData.products && storeData.products.length > 0) {
    const product = storeData.products[0];
    productImageUrl = product.image?.src?.medium 
      || product.image?.url 
      || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);
  }
  const backgroundImageUrl = productImageUrl || storeData.card_background_url;
  
  const formatDate = (dateInput) => {
    if (!dateInput) return null;

    try {
      let date;
      if (typeof dateInput.toDate === 'function') {
        // Firestore Timestamp object from a direct snapshot
        date = dateInput.toDate();
      } else if (dateInput.seconds !== undefined && dateInput.nanoseconds !== undefined) {
        // Serialized Firestore Timestamp-like object
        date = new Date(dateInput.seconds * 1000 + dateInput.nanoseconds / 1000000);
      } else {
        // Fallback for ISO strings or other date formats
        date = new Date(dateInput);
      }

      if (isNaN(date.getTime())) {
        console.warn("Encountered an invalid date value:", dateInput);
        return null;
      }

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", dateInput, error);
      return null;
    }
  };
  
  const formattedDate = formatDate(storeData.created_at || storeData.createdAt);
  
  const getStoreTypeIcon = (niche) => {
    switch (niche) {
      case 'fashion':
        return <ShoppingBag className="h-5 w-5 text-pink-500" />;
      case 'electronics':
        return <Store className="h-5 w-5 text-blue-500" />;
      case 'food':
        return <Store className="h-5 w-5 text-green-500" />;
      case 'jewelry':
        return <Store className="h-5 w-5 text-amber-500" />;
      default:
        return <Store className="h-5 w-5 text-gray-500" />;
    }
  };

  const refreshStats = (e) => {
    e.stopPropagation();
    if (isUserStore) {
      getStoreRevenue(storeData.id).then(setRevenue);
      getStoreCustomers(storeData.id).then(setCustomers);
      getStoreConversionRate(storeData.id).then(setConversionRate);
      getStoreSocialScore(storeData.id).then(setSocialScore);
    }
  };

  const handlePin = async (e) => {
    e.stopPropagation();
    if (isUserStore) {
      const storeRef = doc(db, 'stores', storeData.id);
      await updateDoc(storeRef, {
        pinned: !pinned
      });
      setStoreData(prev => ({ ...prev, pinned: !pinned }));
    }
  };
  
  return (
    <>
      <DeleteStoreModal
        store={storeData}
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
      />
      <div
        className="cursor-pointer"
        onClick={() => {
          if (storeData && storeData.name) {
            navigate(`/${generateStoreUrl(storeData.name)}`);
          } else {
            console.error("Store name is missing, cannot navigate to preview.");
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="store-preview relative bg-cover bg-center rounded-[15px] overflow-hidden" // Apply background to motion.div, ensure overflow hidden for rounded corners
      style={{
        ...(backgroundImageUrl ? { backgroundImage: `url(${backgroundImageUrl})` } : { backgroundColor: '#374151' }),
        ...glowEffect
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: storeData.theme?.primaryColor ? `${storeData.theme.primaryColor}4D` : 'transparent', // 4D is 30% opacity in hex
        }}
      />
      {/* This div is now for the overlay effect if needed, or can be removed if Card handles it all */}
      {/* <div className="absolute inset-0 bg-black/10" /> */} 

      {/* Card itself will have the backdrop blur and semi-transparent background */}
      <Card className="h-full overflow-hidden border-2 border-white/20 hover:border-primary/50 transition-all duration-300 bg-black/30 backdrop-blur-sm text-white rounded-[15px]"> {/* Changed backdrop-blur-md to backdrop-blur-sm and added rounded-[15px] */}
        
        <div className="relative z-10 p-1 rounded-[15px]"> {/* Updated rounding here too for consistency if visible */}
          {isUserStore && (
            <button onClick={handlePin} className={`absolute top-4 right-4 text-white hover:text-gray-300 z-20 ${pinned ? 'text-yellow-500' : ''}`}>
              <Pin className={`h-5 w-5 ${pinned ? 'fill-current' : ''}`} />
            </button>
          )}
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {storeData.logo_url ? (
                  <div className="h-12 w-12 overflow-hidden rounded-sm">
                    <img src={storeData.logo_url} alt={`${storeData.name} logo`} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  getStoreTypeIcon(storeData.niche) // This will use its own colors, might need adjustment
                )}
                <CardTitle className="text-xl text-white drop-shadow-md">{storeData.name}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-white/10 text-white text-xs rounded-full backdrop-blur-xs">
                  {storeData.niche ? storeData.niche.charAt(0).toUpperCase() + storeData.niche.slice(1) : 'General'}
                </span>
              </div>
            </div>
            <CardDescription className="line-clamp-2 mt-1 text-white drop-shadow-sm">
              {storeData.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            {formattedDate && (
              <div className="flex items-center text-sm text-white drop-shadow-sm gap-1 mb-3">
                <Calendar className="h-3.5 w-3.5 mr-1 text-white" />
                Created on {formattedDate}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
            {storeData.products && Array.isArray(storeData.products) && storeData.products.length > 0 ? (
              storeData.products.slice(0, 4).map((product) => {
                const productImageUrl = product.image?.src?.medium 
                  || product.image?.url 
                  || (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);
                
                return (
                  <div
                    key={product.id}
                    className="bg-white/10 p-2 rounded-md text-xs flex items-center gap-2 backdrop-blur-xs cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/${generateStoreUrl(storeData.name)}/product/${encodeURIComponent(product.id)}`);
                    }}
                  >
                    {productImageUrl && (
                      <img src={productImageUrl} alt={product.name} className="w-8 h-8 object-cover rounded-sm" />
                    )}
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium truncate text-white">{product.name || 'Unnamed Product'}</span>
                      <span className="text-white">
                        {typeof product.price === 'number' ? `${product.currencyCode || '$'}${product.price.toFixed(2)}` : 'Price N/A'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-white col-span-2">
                {storeData.products && storeData.products.length === 0 ? 'No products yet.' : 'Product data unavailable.'}
              </p>
            )}
          </div>
            {isUserStore && (
              <div className="mt-4 text-left">
                <p className="text-lg font-semibold text-white">
                  Total Revenue: ${revenue.toFixed(2)}
                </p>
                <div className="flex items-center gap-4 mt-2">
                  <div style={{ width: 50, height: 50 }}>
                    <CircularProgressbar
                      value={socialScore}
                      text={`${socialScore}%`}
                      styles={buildStyles({
                        textColor: 'white',
                        pathColor: 'white',
                        trailColor: 'rgba(255, 255, 255, 0.2)',
                      })}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Social Score</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div>
                    <p className="text-sm text-white">Customers: {customers}</p>
                    <p className="text-sm text-white">Conversion Rate: {conversionRate.toFixed(2)}%</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-gray-300"
                      onClick={refreshStats}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/90 hover:bg-white text-slate-800 border-slate-300 hover:border-slate-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (storeData && storeData.name) { // Check for storeData.name
                          navigate(`/${generateStoreUrl(storeData.name)}`); // Navigate using generateStoreUrl
                        } else {
                          console.error("Store name is missing, cannot navigate to preview.");
                          // Consider adding a toast message for the user here if storeData.name is missing
                        }
                      }}
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              </div>
            )}
        </CardContent>
        <CardFooter className="flex justify-end items-center gap-2 pt-2">
          {isUserStore && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-red-500 hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setIsDeleteModalOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
        </div> 
      </Card>
    </motion.div>
    </div>
    </>
  );
};

export default StoreCard;
