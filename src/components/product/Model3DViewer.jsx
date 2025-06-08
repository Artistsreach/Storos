import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RotateCcw, Maximize2, Download } from 'lucide-react';

const Model3DViewer = ({ 
  modelUrl, 
  thumbnailUrl, 
  productName = 'Product',
  className = '',
  height = '400px',
  showControls = true,
  autoRotate = false,
  cameraControls = true,
  ar = true
}) => {
  const modelViewerRef = useRef(null);

  useEffect(() => {
    // Dynamically load the model-viewer script if not already loaded
    if (!window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      document.head.appendChild(script);
    }
  }, []);

  const resetCamera = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.resetTurntableRotation();
      modelViewerRef.current.jumpCameraToGoal();
    }
  };

  const enterFullscreen = () => {
    if (modelViewerRef.current && modelViewerRef.current.requestFullscreen) {
      modelViewerRef.current.requestFullscreen();
    }
  };

  const downloadModel = () => {
    if (modelUrl) {
      const link = document.createElement('a');
      link.href = modelUrl;
      link.download = `${productName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_3d_model.glb`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!modelUrl) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center p-6" style={{ height }}>
          <p className="text-muted-foreground">No 3D model available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 relative">
        <model-viewer
          ref={modelViewerRef}
          src={modelUrl}
          poster={thumbnailUrl}
          alt={`3D model of ${productName}`}
          style={{ 
            width: '100%', 
            height,
            backgroundColor: '#f8f9fa'
          }}
          camera-controls={cameraControls}
          auto-rotate={autoRotate}
          ar={ar}
          ar-modes="webxr scene-viewer quick-look"
          environment-image="neutral"
          shadow-intensity="1"
          exposure="1"
          tone-mapping="neutral"
          loading="eager"
        >
          {/* Loading indicator */}
          <div slot="progress-bar" className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading 3D model...</p>
            </div>
          </div>
          
          {/* Error fallback */}
          <div slot="error" className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="text-center">
              <p className="text-destructive mb-2">Failed to load 3D model</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </model-viewer>

        {/* Control buttons */}
        {showControls && (
          <div className="absolute top-2 right-2 flex flex-col space-y-1">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/80 hover:bg-background"
              onClick={resetCamera}
              title="Reset camera"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/80 hover:bg-background"
              onClick={enterFullscreen}
              title="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/80 hover:bg-background"
              onClick={downloadModel}
              title="Download model"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* AR button (will be shown automatically by model-viewer if AR is supported) */}
        <div className="absolute bottom-2 right-2">
          {/* The AR button is automatically added by model-viewer */}
        </div>
      </CardContent>
    </Card>
  );
};

export default Model3DViewer;
