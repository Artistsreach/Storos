import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/contexts/StoreContext';

const CartModal = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQuantity } = useStore();

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const modalVariants = {
    hidden: { x: '100%' },
    visible: { x: 0, transition: { duration: 0.5, ease: 'easeInOut' } },
    exit: { x: '100%', transition: { duration: 0.5, ease: 'easeInOut' } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="fixed inset-0 bg-black/60" onClick={onClose} />
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <ShoppingCart className="w-7 h-7" />
                Your Cart
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-6 h-6" />
              </Button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <ShoppingCart className="w-24 h-24 text-gray-300 dark:text-gray-600 mb-6" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Your cart is empty</h3>
                <p className="text-gray-500 dark:text-gray-400">Looks like you haven't added anything to your cart yet.</p>
              </div>
            ) : (
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img src={item.image?.src?.medium || item.image?.src?.large || ''} alt={item.name} className="w-24 h-24 rounded-lg object-cover" />
                    <div className="flex-grow">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Button size="icon" variant="outline" onClick={() => updateCartQuantity(item.id, item.quantity - 1)}>
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold text-lg">{item.quantity}</span>
                        <Button size="icon" variant="outline" onClick={() => updateCartQuantity(item.id, item.quantity + 1)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-600 dark:text-gray-300">Subtotal</span>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white">${cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full text-lg py-3">
                  Proceed to Checkout
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartModal;
