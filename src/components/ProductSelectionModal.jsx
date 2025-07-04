import React, { useState } from 'react';

const ProductSelectionModal = ({ isOpen, onClose, products, onSelectProducts }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);

  if (!isOpen) {
    return null;
  }

  const handleProductSelection = (product) => {
    setSelectedProducts((prevSelected) => {
      if (prevSelected.find((p) => p.id === product.id)) {
        return prevSelected.filter((p) => p.id !== product.id);
      } else {
        return [...prevSelected, product];
      }
    });
  };

  const handleDone = () => {
    onSelectProducts(selectedProducts);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Select Products</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className={`flex items-center p-4 border dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selectedProducts.find((p) => p.id === product.id) ? 'border-blue-500' : ''
              }`}
              onClick={() => handleProductSelection(product)}
            >
              <img src={product.images[0]} alt={product.name} className="w-10 h-10 mr-4" />
              <div>
                <h3 className="font-bold dark:text-white">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-4">
          <button className="btn mr-2 dark:text-white" onClick={onClose}>
            Cancel
          </button>
          <button className="btn text-gray-800 dark:text-white" onClick={handleDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectionModal;
