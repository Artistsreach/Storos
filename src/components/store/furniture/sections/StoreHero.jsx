import React from 'react';

const StoreHero = ({ store, isPublishedView }) => {
  return (
    <div className="bg-gray-100 py-16">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">{store.name}</h1>
        <p className="text-lg mb-8">{store.description}</p>
        <button className="bg-amber-700 text-white px-6 py-3 rounded-md hover:bg-amber-800">
          Shop Collection
        </button>
      </div>
    </div>
  );
};

export default StoreHero;
