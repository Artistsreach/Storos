import Spline from '@splinetool/react-spline';
import { useState } from 'react';

export default function SplineScene() {
  const [hasError, setHasError] = useState(false);

  const handleSplineError = () => {
    console.log('Spline scene failed to load, showing fallback');
    setHasError(true);
  };

  if (hasError) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary/40 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">3D Scene Unavailable</h2>
          <p className="text-muted-foreground">The requested Spline scene could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <Spline 
        scene="https://prod.spline.design/yFIOdXedSXf3xr4m/scene.splinecode"
        style={{ width: '100%', height: '100%' }}
        onError={handleSplineError}
      />
    </div>
  );
}
