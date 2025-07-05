import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Loader2, Upload } from 'lucide-react';
import { visualizeProductOnSubject } from '../lib/geminiImageGeneration';

const ProductVisualizationModal = ({ isOpen, onClose, product }) => {
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visualizedImage, setVisualizedImage] = useState(null);
  const [customInstructions, setCustomInstructions] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (product) {
      setReferenceImage(null);
      setReferenceImageUrl(null);
      setVisualizedImage(null);
      setIsLoading(false);
      setCustomInstructions('');
      setError(null);
    }
  }, [product]);

  const fileToGenerativePart = async (file) => {
    const base64EncodedData = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return { base64Data: base64EncodedData, mimeType: file.type };
  };

  const handleVisualize = async () => {
    if (!referenceImage || !product) {
      return;
    }

    setIsLoading(true);
    setVisualizedImage(null);
    setError(null);
    
    console.log("Starting visualization for product:", product);

    try {
      const { base64Data: referenceBase64, mimeType: referenceMimeType } = await fileToGenerativePart(referenceImage);
      
      const productImageUrl = product.imageUrl || product.product_photo || (product.product_photos && product.product_photos[0]) || product.image || product.product_main_image_url;
      
      console.log("Determined product image URL:", productImageUrl);

      if (!productImageUrl) {
        console.error("Product image URL is missing from product object:", product);
        throw new Error("Product image URL is missing.");
      }

      // The visualize function now fetches the product image, so we just pass the URL
      const result = await visualizeProductOnSubject(
        referenceBase64,
        referenceMimeType,
        productImageUrl,
        customInstructions || `Visualize the product on/in the reference/context.`, // Pass custom instructions as the original prompt
        product.product_title || product.name || product.title
      );

      if (result.visualizedImageData) {
        setVisualizedImage(`data:${result.visualizedImageMimeType};base64,${result.visualizedImageData}`);
      } else {
        throw new Error(result.error || "Could not generate visualization. Please try again.");
      }
    } catch (err) {
      console.error("Error during visualization:", err);
      setError(`An error occurred: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReferenceImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background z-10 pt-6">
          <DialogTitle>Visualize {product?.product_title || product?.name}</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          {visualizedImage ? (
            <div>
              <div className="flex justify-center mb-4">
                <img src={visualizedImage} alt="Visualized Product" className="rounded-lg max-w-full h-auto" />
              </div>
              <div className="flex justify-around items-start mb-4">
                <div className="w-1/2 p-2 text-center">
                  <h3 className="text-lg font-semibold mb-2">Product</h3>
                  <img
                    src={product?.imageUrl || product?.product_photo || (product?.product_photos && product?.product_photos[0]) || product?.image || product?.product_main_image_url}
                    alt={product?.product_title || product?.name}
                    className="max-w-full h-auto rounded-lg mx-auto"
                    style={{ maxHeight: '150px' }}
                  />
                </div>
                <div className="w-1/2 p-2 text-center">
                  <h3 className="text-lg font-semibold mb-2">Your Design</h3>
                  <img
                    src={referenceImageUrl}
                    alt="Reference"
                    className="max-w-full h-auto rounded-lg mx-auto"
                    style={{ maxHeight: '150px' }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-around items-start mb-4">
              {/* Product Image */}
              <div className="w-1/2 p-2 text-center">
                <h3 className="text-lg font-semibold mb-2">Product</h3>
                <img
                  src={product?.imageUrl || product?.product_photo || (product?.product_photos && product?.product_photos[0]) || product?.image || product?.product_main_image_url}
                  alt={product?.product_title || product?.name}
                  className="max-w-full h-auto rounded-lg mx-auto"
                  style={{ maxHeight: '300px' }}
                />
              </div>

              {/* Reference Image or Upload */}
              <div className="w-1/2 p-2 text-center">
                <h3 className="text-lg font-semibold mb-2">Your Design</h3>
                {!referenceImageUrl ? (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
                      </div>
                      <Input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </label>
                  </div>
                ) : (
                  <div>
                    <img src={referenceImageUrl} alt="Reference" className="max-w-full h-auto rounded-lg mx-auto mb-2" style={{ maxHeight: '300px' }} />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('dropzone-file').click()}>
                      Change Image
                    </Button>
                    {/* Hidden input for re-upload */}
                    <Input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-4">
            <Input
              type="text"
              placeholder="Optional: Add custom instructions (e.g., 'place it on the left')"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        </div>
        <DialogFooter className="sticky bottom-0 bg-background z-10 pb-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleVisualize} disabled={!referenceImage || isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : 'Visualize'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductVisualizationModal;
