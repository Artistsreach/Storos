
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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Store, 
  Edit, 
  Trash2, 
  ShoppingBag, 
  Calendar,
  Lock,
  UserPlus // Added for assigning manager
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { fetchPexelsImages } from '@/lib/utils.jsx'; // Added for Pexels
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
} from '@/components/ui/alert-dialog';
import { useStore } from '@/contexts/StoreContext';

const StoreCard = ({ store }) => {
  const navigate = useNavigate();
  const { deleteStore, updateStorePassKey, assignStoreManager, updateStoreTemplateVersion } = useStore(); 
  const [passKey, setPassKey] = React.useState('');
  const [managerEmail, setManagerEmail] = React.useState('');
  const [isAssigningManager, setIsAssigningManager] = React.useState(false); // New state for toggling manager input
  // backgroundImageUrl and isBgLoading state and useEffect are removed,
  // as card_background_url will come directly from the store object.

  const handleLockStore = () => {
    if (updateStorePassKey && passKey && store.id) {
      updateStorePassKey(store.id, passKey);
      // Optionally clear the input after setting or give feedback
      // setPassKey(''); 
      // Consider adding a toast notification for success
    }
  };

  const handleAssignManager = () => {
    if (assignStoreManager && managerEmail && store.id) {
      assignStoreManager(store.id, managerEmail);
      // Optionally clear the input after setting or give feedback
      // setManagerEmail('');
      // Consider adding a toast notification for success
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return 'Error Date';
    }
  };
  
  const getStoreTypeIcon = (type) => {
    switch (type) {
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
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="store-preview relative bg-cover bg-center rounded-lg overflow-hidden" // Apply background to motion.div, ensure overflow hidden for rounded corners
      style={store.card_background_url ? { backgroundImage: `url(${store.card_background_url})` } : { backgroundColor: '#374151' }} // Dark gray fallback
    >
      {/* This div is now for the overlay effect if needed, or can be removed if Card handles it all */}
      {/* <div className="absolute inset-0 bg-black/10" /> */} 

      {/* Card itself will have the backdrop blur and semi-transparent background */}
      <Card className="h-full overflow-hidden border-2 border-white/20 hover:border-primary/50 transition-all duration-300 bg-black/30 backdrop-blur-sm text-white"> {/* Changed backdrop-blur-md to backdrop-blur-sm */}
        
        <div className="relative z-10 p-1 rounded-lg"> 
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={`${store.name} logo`} className="h-6 w-6 rounded-sm object-contain bg-white/30 p-0.5" />
                ) : (
                  getStoreTypeIcon(store.type) // This will use its own colors, might need adjustment
                )}
                <CardTitle className="text-xl text-white drop-shadow-md">{store.name}</CardTitle>
              </div>
              <span className="px-2 py-1 bg-white/10 text-gray-200 text-xs rounded-full backdrop-blur-xs">
                {store.type.charAt(0).toUpperCase() + store.type.slice(1)}
              </span>
            </div>
            <CardDescription className="line-clamp-2 mt-1 text-gray-300 drop-shadow-sm">
              {store.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center text-sm text-gray-300 drop-shadow-sm gap-1 mb-3">
              <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
              Created on {formatDate(store.created_at || store.createdAt)}
            </div>
            
            <div className="grid grid-cols-2 gap-2">
            {store && store.products && Array.isArray(store.products) && store.products.length > 0 ? (
              store.products.slice(0, 4).map((product) => ( 
                <div 
                  key={product.id} 
                  className="bg-white/10 p-2 rounded-md text-xs flex flex-col backdrop-blur-xs"
                >
                  <span className="font-medium truncate text-gray-200">{product.name || 'Unnamed Product'}</span>
                  <span className="text-sky-300"> {/* Using a specific bright color for price */}
                    {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : 'Price N/A'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 col-span-2">
                {store && store.products && store.products.length === 0 ? 'No products yet.' : 'Product data unavailable.'}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 pt-2">
          <div className="flex w-full justify-between items-center">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/90 hover:bg-white text-slate-800 border-slate-300 hover:border-slate-400"
              onClick={() => {
                if (store && store.id) {
                  navigate(`/store/${store.id}`);
                } else {
                  console.error("Store ID is missing, cannot navigate to preview.");
                  // Consider adding a toast message for the user here if store.id is missing
                }
              }}
            >
              Preview
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-300 hover:text-white hover:bg-white/10"
                onClick={() => navigate(`/store/${store.id}?edit=true`)}
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the "{store.name}" store and all its data.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-500 text-white hover:bg-red-600"
                      onClick={() => deleteStore(store.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="flex w-full items-center gap-2 mt-2">
            <Input 
              type="password" 
              placeholder="Set Pass Key" 
              value={passKey}
              onChange={(e) => setPassKey(e.target.value)}
              className="h-8 text-xs flex-grow bg-neutral-700/60 dark:bg-neutral-800/60 border-neutral-500 dark:border-neutral-600 placeholder-gray-300 text-white focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 bg-white/90 hover:bg-white text-slate-800 border-slate-300 hover:border-slate-400"
              onClick={handleLockStore}
              disabled={!passKey.trim()} 
            >
              <Lock className="h-4 w-4" />
              <span className="sr-only">Set Pass Key</span>
            </Button>
          </div>

          {/* Assign Manager Section */}
          <div className="w-full mt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-white/10 hover:bg-white/20 text-gray-200 border-gray-500 hover:border-gray-400"
              onClick={() => setIsAssigningManager(!isAssigningManager)}
            >
              {isAssigningManager ? 'Cancel Assignment' : 'Assign Manager'}
            </Button>
            {isAssigningManager && (
              <div className="flex w-full items-center gap-2 mt-2">
                <Input 
                  type="email" 
                  placeholder="Manager Email" 
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  className="h-8 text-xs flex-grow bg-neutral-700/60 dark:bg-neutral-800/60 border-neutral-500 dark:border-neutral-600 placeholder-gray-300 text-white focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 bg-white/90 hover:bg-white text-slate-800 border-slate-300 hover:border-slate-400"
                  onClick={() => {
                    handleAssignManager();
                    // Optionally hide the input after submission attempt
                    // setIsAssigningManager(false); 
                    // setManagerEmail('');
                  }}
                  disabled={!managerEmail.trim()} 
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="sr-only">Confirm Assign Manager</span>
                </Button>
              </div>
            )}
          </div>
        </CardFooter>
        </div> 
      </Card>
    </motion.div>
  );
};

export default StoreCard;
