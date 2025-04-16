
import React from 'react';
import { motion } from 'framer-motion';
import { Play, RefreshCw, Menu, Plus, Minus, PauseCircle } from 'lucide-react';

interface GameControlsProps {
  spinning: boolean;
  betAmount: number;
  minBet: number;
  maxBet: number;
  autoSpin: boolean;
  extraBet: boolean;
  changeBet: (amount: number) => void;
  handleSpin: () => void;
  setAutoSpin: (auto: boolean) => void;
}

const GameControls = ({ 
  spinning, 
  betAmount, 
  minBet, 
  maxBet, 
  autoSpin, 
  extraBet,
  changeBet, 
  handleSpin, 
  setAutoSpin 
}: GameControlsProps) => {
  // Set min and max bet limits
  const MIN_BET = 10;
  const MAX_BET = 1000; 
  
  return (
    <div className="mt-4 flex-1 flex flex-col justify-end">
      {/* Control buttons */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        <motion.button 
          className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-green-500"
          whileHover={{ scale: 1.1, boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => changeBet(-10)}
          disabled={spinning || betAmount <= MIN_BET}
        >
          <Minus size={24} />
        </motion.button>
        
        <motion.button 
          className="bg-amber-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-amber-400"
          whileHover={{ scale: 1.1, boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => changeBet(-50)}
          disabled={spinning || betAmount <= MIN_BET + 50}
        >
          <div className="font-bold">-50</div>
        </motion.button>
        
        <motion.button 
          className={`${spinning ? 'bg-red-600' : 'bg-red-500'} text-white w-16 h-16 rounded-full flex items-center justify-center shadow-xl border-4 border-red-400`}
          whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(239, 68, 68, 0.6)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (spinning) return;
            if (autoSpin) {
              setAutoSpin(false);
              return;
            }
            handleSpin();
          }}
          disabled={spinning}
        >
          {spinning ? (
            <RefreshCw size={30} className="animate-spin" />
          ) : autoSpin ? (
            <PauseCircle size={30} />
          ) : (
            <Play size={30} className="ml-1" />
          )}
        </motion.button>
        
        <motion.button 
          className="bg-amber-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-amber-400"
          whileHover={{ scale: 1.1, boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => changeBet(50)}
          disabled={spinning || betAmount >= MAX_BET - 50}
        >
          <div className="font-bold">+50</div>
        </motion.button>
        
        <motion.button 
          className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-green-500"
          whileHover={{ scale: 1.1, boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => changeBet(10)}
          disabled={spinning || betAmount >= MAX_BET}
        >
          <Plus size={24} />
        </motion.button>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <motion.button 
          className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-green-500"
          whileHover={{ scale: 1.1, boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => changeBet(MIN_BET - betAmount)}
          disabled={spinning}
        >
          <div className="font-bold">{MIN_BET}</div>
        </motion.button>
        
        <motion.button
          className={`bg-yellow-600 text-white py-3 px-4 rounded-lg shadow-lg border border-yellow-500 font-bold ${spinning ? 'opacity-50' : ''}`}
          whileHover={{ scale: 1.05, boxShadow: '0 0 8px rgba(234, 179, 8, 0.6)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => !spinning && setAutoSpin(!autoSpin)}
          disabled={spinning}
        >
          <div className="text-center">
            <div className="text-xs">BET</div>
            <div className="text-lg">{extraBet ? betAmount * 2 : betAmount}</div>
          </div>
        </motion.button>
        
        <motion.button 
          className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg border border-green-500"
          whileHover={{ scale: 1.1, boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)' }}
          whileTap={{ scale: 0.9 }}
          onClick={() => changeBet(MAX_BET - betAmount)}
          disabled={spinning}
        >
          <Menu size={24} />
        </motion.button>
      </div>
      
      <div className="text-center text-xs text-gray-400 mt-2">
        ver. super-1.0
      </div>
    </div>
  );
};

export default GameControls;
