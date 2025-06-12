import React from 'react';
import Layout from './components/layout/Layout';
import Hero from './components/sections/Hero';
import Features from './components/sections/Features';
import StoreFeatures from './components/sections/StoreFeatures';
import StoreWay from './components/sections/StoreWay';
import Newsletter from './components/sections/Newsletter';
import { storeData } from './data/storeData';
import './App.css';

function App() {
  return (
    <Layout storeData={storeData}>
      <Hero heroData={storeData.hero} />
      <Features featuresData={storeData.features} />
      <StoreFeatures storeFeaturesData={storeData.storeFeatures} />
      <StoreWay storeWayData={storeData.storeWay} />
      <Newsletter newsletterData={storeData.newsletter} />
    </Layout>
  );
}

export default App;
