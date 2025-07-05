import React from 'react';
import { Button } from './ui/button';
import { BarChart2, GitCompare, Scan } from 'lucide-react';

const ProductActions = ({ product, onVisualize, onAnalyze, onCompare, imageUrl }) => {
  const handleVisualizeClick = () => {
    if (onVisualize) {
      onVisualize(product, imageUrl);
    }
  };

  const handleAnalyzeClick = () => {
    if (onAnalyze) {
      onAnalyze(product);
    }
  };

  const handleCompareClick = () => {
    if (onCompare) {
      onCompare(product);
    }
  };

  return (
    <div className="flex justify-around mt-2">
      <Button variant="ghost" size="sm" onClick={handleAnalyzeClick}>
        <BarChart2 className="h-4 w-4 mr-1" />
        Analyze
      </Button>
      <Button variant="ghost" size="sm" onClick={handleCompareClick}>
        <GitCompare className="h-4 w-4 mr-1" />
        Compare
      </Button>
      <Button variant="ghost" size="sm" onClick={handleVisualizeClick}>
        <Scan className="h-4 w-4 mr-1" />
        Visualize
      </Button>
    </div>
  );
};

export default ProductActions;
