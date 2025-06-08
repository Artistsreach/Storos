import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useStore } from '../contexts/StoreContext';

const GenerationProgressDisplay = () => {
  const { isGenerating, progress, statusMessage } = useStore();

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '20px', opacity: 1 }} // Drops down to 20px from top
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          // Apply flex to center the Card child, ensure motion.div spans width for centering logic
          className="fixed top-0 left-0 right-0 flex justify-center z-[9999] p-4" 
        >
          <Card className="shadow-2xl rounded-xl overflow-hidden w-full max-w-md"> {/* Card takes max-w-md */}
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Store Generation</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{Math.floor(progress)}%</p>
              </div>
              <Progress value={progress} className="w-full h-2 [&>div]:bg-blue-600" />
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-1 min-h-[1.2em]">
                {statusMessage || 'Processing...'}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenerationProgressDisplay;
