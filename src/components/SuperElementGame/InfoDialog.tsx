
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import ElementSymbol from './ElementSymbol';

interface InfoDialogProps {
  showRules: boolean;
  setShowRules: (show: boolean) => void;
  symbols: Array<{
    id: string;
    element: string;
    shape: string;
    color: string;
    value: number;
  }>;
  winPatterns: number[][][];
}

const InfoDialog = ({ showRules, setShowRules, symbols, winPatterns }: InfoDialogProps) => {
  if (!showRules) return null;
  
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gradient-to-b from-blue-900 to-indigo-950 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-400">Game Rules</h2>
            <button 
              className="bg-red-600 text-white p-2 rounded-full"
              onClick={() => setShowRules(false)}
            >
              <X />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-blue-300 mb-2">How to Play</h3>
              <p className="text-gray-300">
                Match 3 or more identical elements in a row, column, or diagonal to win! Each symbol has different values.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-blue-300 mb-2">Element Values</h3>
              <div className="grid grid-cols-2 gap-3">
                {symbols.map(symbol => (
                  <div key={symbol.id} className="flex items-center bg-blue-900/50 p-2 rounded-lg">
                    <ElementSymbol 
                      element={symbol.element} 
                      shape={symbol.shape}
                      color={symbol.color}
                      size={40}
                    />
                    <div className="ml-2">
                      <div className="capitalize font-medium text-white">{symbol.id}</div>
                      <div className="text-sm text-yellow-400">Multiplier: x{symbol.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-blue-300 mb-2">Winning Patterns</h3>
              <p className="text-gray-300 mb-2">
                Any matching symbols in these patterns will award wins:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-900/50 p-2 rounded">
                  <p className="text-white font-medium mb-1">Horizontal Lines</p>
                  <p className="text-gray-300 text-sm">Complete rows of matching symbols</p>
                </div>
                <div className="bg-blue-900/50 p-2 rounded">
                  <p className="text-white font-medium mb-1">Vertical Lines</p>
                  <p className="text-gray-300 text-sm">Complete columns of matching symbols</p>
                </div>
                <div className="bg-blue-900/50 p-2 rounded">
                  <p className="text-white font-medium mb-1">Diagonal Lines</p>
                  <p className="text-gray-300 text-sm">Diagonal patterns of matching symbols</p>
                </div>
                <div className="bg-blue-900/50 p-2 rounded">
                  <p className="text-white font-medium mb-1">Wild Symbol</p>
                  <p className="text-gray-300 text-sm">Substitutes for any other symbol</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-blue-300 mb-2">Special Features</h3>
              <div className="space-y-2">
                <div className="bg-blue-900/50 p-2 rounded">
                  <p className="text-white font-medium mb-1">Extra Bet</p>
                  <p className="text-gray-300 text-sm">Double your bet for increased winning chances</p>
                </div>
                <div className="bg-blue-900/50 p-2 rounded">
                  <p className="text-white font-medium mb-1">Buy Feature</p>
                  <p className="text-gray-300 text-sm">Purchase special game features for immediate rewards</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InfoDialog;
