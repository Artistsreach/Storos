import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';

const StoreSelectionModal = ({ isOpen, onClose, onSelectStore, isSelectingStore }) => {
  const { stores, loadStores, isLoadingStores } = useStore();
  const { user } = useAuth();
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const userStores = useMemo(() => {
    if (!user) return [];
    return stores.filter(store => store.merchant_id === user.uid);
  }, [stores, user]);

  useEffect(() => {
    if (isOpen) {
      loadStores();
    }
  }, [isOpen, loadStores]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-lg w-full relative">
        {isSelectingStore && (
          <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex flex-col justify-center items-center z-10">
            <div className="loading loading-spinner loading-lg"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        )}
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Select a Store</h2>
        {isLoadingStores ? (
          <p className="dark:text-white">Loading stores...</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {userStores.map((store) => (
              <div
                key={store.id}
                className="flex items-center p-4 border dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  setSelectedStoreId(store.id);
                  onSelectStore(store);
                }}
              >
                <img src={store.logo_url} alt={`${store.name} logo`} className="w-10 h-10 mr-4" />
                <div className="flex-grow">
                  <h3 className="font-bold dark:text-white">{store.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{store.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button className="btn dark:text-white" onClick={onClose} disabled={isSelectingStore}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreSelectionModal;
