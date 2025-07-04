import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Coins } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

const CreditCostsModal = ({ isOpen, onClose, onSubscribe }) => {
  const creditCosts = [
    { action: 'Store Generation', cost: 25 },
    { action: 'Page Generation', cost: 25 },
    { action: 'Image Generation', cost: 5 },
    { action: 'Image Editing', cost: 2 },
    { action: 'Video Generation', cost: 15 },
    { action: 'Podcast Generation', cost: 10 },
  ].sort((a, b) => b.cost - a.cost);

  const handleSubscribe = () => {
    onSubscribe();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Coins className="h-6 w-6 text-yellow-500 mr-2" />
            Credit Costs
          </DialogTitle>
          <DialogDescription>
            Here's a breakdown of how many credits each action costs.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ul className="space-y-2">
            {creditCosts.map((item, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{item.action}</span>
                <span className="font-bold flex items-center">
                  {item.cost} <Coins className="h-4 w-4 text-yellow-500 ml-1" />
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Get 500 credits each month for only $12.99
          </p>
          <Button
            onClick={handleSubscribe}
            className="w-full dark:text-black"
          >
            Subscribe to Pro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditCostsModal;
