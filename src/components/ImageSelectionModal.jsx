import React, { useState, useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';
import { fetchPexelsImages } from '../lib/utils.js';

const ImageSelectionModal = ({ isOpen, onClose, onImageSelect }) => {
  const { stores, loadStores } = useStore();
  const [activeTab, setActiveTab] = useState('pexels');
  const [pexelsSearchTerm, setPexelsSearchTerm] = useState('');
  const [pexelsImages, setPexelsImages] = useState([]);
  const [isLoadingPexels, setIsLoadingPexels] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadStores();
    }
  }, [isOpen, loadStores]);

  const handlePexelsSearch = async (e) => {
    e.preventDefault();
    if (!pexelsSearchTerm) return;
    setIsLoadingPexels(true);
    const images = await fetchPexelsImages(pexelsSearchTerm, 20);
    setPexelsImages(images);
    setIsLoadingPexels(false);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full h-3/4 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Select an Image</h2>
        <div className="tabs">
          <button className={`tab tab-bordered ${activeTab === 'pexels' ? 'tab-active' : ''}`} onClick={() => setActiveTab('pexels')}>Pexels</button>
          <button className={`tab tab-bordered ${activeTab === 'my-images' ? 'tab-active' : ''}`} onClick={() => setActiveTab('my-images')}>My Store Images</button>
        </div>
        <div className="flex-grow overflow-y-auto mt-4">
          {activeTab === 'pexels' && (
            <div>
              <form onSubmit={handlePexelsSearch} className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Search Pexels..."
                  className="input input-bordered w-full"
                  value={pexelsSearchTerm}
                  onChange={(e) => setPexelsSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" disabled={isLoadingPexels}>
                  {isLoadingPexels ? 'Searching...' : 'Search'}
                </button>
              </form>
              {isLoadingPexels ? (
                <p>Loading images...</p>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {pexelsImages.map((image) => (
                    <img
                      key={image.id}
                      src={image.src.medium}
                      alt={image.alt}
                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                      onClick={() => onImageSelect(image.src.large)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'my-images' && (
            <div>
              <select
                className="select select-bordered w-full mb-4"
                onChange={(e) => setSelectedStore(stores.find(s => s.id === e.target.value))}
                defaultValue=""
              >
                <option value="" disabled>Select a store</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.name}</option>
                ))}
              </select>
              {selectedStore && (
                <div className="grid grid-cols-4 gap-4">
                  {selectedStore.products.flatMap(p => p.images).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                      onClick={() => onImageSelect(image)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSelectionModal;
