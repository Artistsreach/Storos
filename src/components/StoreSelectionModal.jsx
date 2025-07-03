import React, { useEffect, useMemo } from 'react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';

const StoreSelectionModal = ({ isOpen, onClose, onSelectStore }) => {
  const { stores, loadStores, isLoadingStores } = useStore();
  const { user } = useAuth();

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
      <div className="bg-white rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Select a Store</h2>
        {isLoadingStores ? (
          <p>Loading stores...</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {userStores.map((store) => (
              <div
                key={store.id}
                className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-100"
                onClick={() => onSelectStore(store)}
              >
                <img src={store.logo_url} alt={`${store.name} logo`} className="w-10 h-10 mr-4" />
                <div>
                  <h3 className="font-bold">{store.name}</h3>
                  <p className="text-sm text-gray-600">{store.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreSelectionModal;
