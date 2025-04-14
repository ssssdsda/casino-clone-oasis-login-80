
import React from 'react';
import { motion } from 'framer-motion';

interface GameGridProps {
  symbols: Record<string, string>;
  reels: string[];
  winningLines: number[][];
  rows?: number;
  cols?: number;
}

const GameGrid: React.FC<GameGridProps> = ({ 
  symbols, 
  reels, 
  winningLines,
  rows = 3,
  cols = 5
}) => {
  return (
    <div className="relative z-10 bg-gray-900/80 border-4 border-gray-700 rounded-lg p-2 shadow-2xl">
      <div className={`grid grid-cols-${cols} grid-rows-${rows} gap-1`}>
        {reels.map((symbol, index) => (
          <motion.div
            key={index}
            className={`bg-purple-900 border-2 ${
              winningLines.some(line => line.includes(index))
                ? 'border-yellow-400 animate-pulse'
                : 'border-purple-700'
            } rounded overflow-hidden flex items-center justify-center`}
            initial={{ opacity: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: winningLines.some(line => line.includes(index)) ? [1, 1.05, 1] : 1 
            }}
            transition={{ 
              duration: 0.2, 
              scale: { repeat: winningLines.some(line => line.includes(index)) ? Infinity : 0, duration: 0.5 } 
            }}
          >
            <img 
              src={symbols[symbol as keyof typeof symbols]} 
              alt={symbol} 
              className="w-20 h-20 object-contain"
              loading="eager"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GameGrid;
