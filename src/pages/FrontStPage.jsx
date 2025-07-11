import Spline from '@splinetool/react-spline';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function FrontStPage() {
  const [hasError, setHasError] = useState(false);
  const [storeName, setStoreName] = useState('');
  const location = useLocation();
  const splineRef = useRef(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const name = searchParams.get('storeName') || 'Store Name';
    setStoreName(name);
  }, [location.search]);

  useEffect(() => {
    if (splineRef.current && storeName) {
      try {
        splineRef.current.setVariable('storeName', storeName);
      } catch (error) {
        console.log('Spline variable update will be applied once scene loads');
      }
    }
  }, [storeName]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStoreName(prevName => (prevName ? prevName + ' ' : prevName));
    }, 10000); // 10 seconds

    return () => clearTimeout(timer); // Cleanup the timer
  }, []); // Run only once on mount

  const onSplineLoad = (spline) => {
    splineRef.current = spline;
    if (storeName) {
      try {
        spline.setVariable('storeName', storeName);
      } catch (error) {
        console.log('Setting initial storeName variable');
      }
    }
  };

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
      {storeName && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
          <label htmlFor="storeNameInput" className="mr-2">Store:</label>
          <input
            id="storeNameInput"
            type="text"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="bg-transparent border-b-2 border-white focus:outline-none"
          />
        </div>
      )}
      <Spline 
        scene="https://prod.spline.design/yFIOdXedSXf3xr4m/scene.splinecode"
        onLoad={onSplineLoad}
        style={{ width: '100%', height: '100%' }}
        onError={handleSplineError}
      />
    </div>
  );
}
