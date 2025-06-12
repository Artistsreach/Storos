import React from 'react';

const StoreHeader = ({ store, isPublishedView }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-xl font-bold">{store.name}</div>
        <nav>
          <ul className="flex space-x-4">
            <li>Home</li>
            <li>Products</li>
            <li>Collections</li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default StoreHeader;
