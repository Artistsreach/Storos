import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebaseClient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Paperclip, X, Store } from 'lucide-react';
import StoreSelectionModal from './StoreSelectionModal';
import ProductSelectionModal from './ProductSelectionModal';

const CreatePost = () => {
  const { user, profile } = useAuth();
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImages((prevImages) => [...prevImages, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    }
  };

  const handleSelectStore = (store) => {
    setSelectedStore(store);
    setIsStoreModalOpen(false);
  };

  const handleSelectProducts = (products) => {
    setSelectedProducts(products);
    setIsProductModalOpen(false);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.filter((p) => p.id !== productId)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && images.length === 0 && !selectedStore) {
      return;
    }

    setUploading(true);
    const imageUrls = [];
    if (images.length > 0) {
      for (const image of images) {
        const imageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${image.name}`);
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }
    }

    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        username: profile.username,
        profilePhoto: profile.profilePhoto,
        text,
        imageUrls,
        store: selectedStore,
        products: selectedProducts,
        timestamp: serverTimestamp(),
      });
      setText('');
      setImages([]);
      setImagePreviews([]);
      setSelectedStore(null);
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-2 pr-10 border dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-neutral-800 text-black dark:text-white"
            />
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Preview ${index}`} className="rounded-lg object-cover h-32 w-full" />
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...images];
                        newImages.splice(index, 1);
                        setImages(newImages);

                        const newPreviews = [...imagePreviews];
                        newPreviews.splice(index, 1);
                        setImagePreviews(newPreviews);
                      }}
                      className="absolute top-1 right-1 bg-gray-800 text-white rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="absolute top-2 right-2 flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => document.getElementById('file-upload').click()}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => setIsStoreModalOpen(true)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                <Store className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center mt-1 sm:mt-4">
            <div className="flex flex-wrap items-center mb-4 sm:mb-0">
              {selectedStore && (
                <div className="flex items-center ml-0 sm:ml-4 mt-2 sm:mt-0">
                  <img src={selectedStore.logo_url} alt={selectedStore.name} className="w-8 h-8 rounded-full" />
                  <p className="ml-2 text-sm dark:text-gray-300">{selectedStore.name}</p>
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(true)}
                    className="ml-4 bg-gray-200 text-gray-800 px-2 py-1 rounded-lg text-xs dark:bg-neutral-700 dark:text-white"
                  >
                    Add Products
                  </button>
                </div>
              )}
            </div>
            <button type="submit" disabled={uploading} className="bg-green-600 text-white px-4 py-2 rounded-lg w-full sm:w-auto">
              {uploading ? 'Posting...' : 'Post'}
            </button>
          </div>
          {selectedProducts.length > 0 && (
            <div className="mt-4">
              <h4 className="font-bold mb-2 dark:text-white">Selected Products</h4>
              <div className="flex flex-col gap-4">
                {selectedProducts.map((product) => (
                  <div key={product.id} className="relative flex items-center border dark:border-neutral-800 rounded-lg p-2 bg-white dark:bg-neutral-800">
                    <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded-md" />
                    <p className="text-sm ml-4 dark:text-gray-300">{product.name}</p>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product.id)}
                      className="absolute top-1 right-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
      <StoreSelectionModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
        onSelectStore={handleSelectStore}
      />
      {selectedStore && (
        <ProductSelectionModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          products={selectedStore.products}
          onSelectProducts={handleSelectProducts}
        />
      )}
    </>
  );
};

export default CreatePost;
