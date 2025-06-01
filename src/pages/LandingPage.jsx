import AIAssistant from 'components/landing/AIAssistant';
import ContentCreator from 'components/landing/ContentCreator';
import Features from 'components/landing/Features';
import Hero from 'components/landing/Hero';
import ImportIntegration from 'components/landing/ImportIntegration';
import ProductTools from 'components/landing/ProductTools';
import SalesPerformance from 'components/landing/SalesPerformance';

const LandingPage = () => {
  return (
    <div>
      <Hero />
      <Features />
      <AIAssistant />
      <ContentCreator />
      <ProductTools />
      <ImportIntegration />
      <SalesPerformance />
      {/* You can add a common Footer component here if you have one */}
    </div>
  );
};

export default LandingPage;
