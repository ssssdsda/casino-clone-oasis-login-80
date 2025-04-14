
import React from 'react';
import { motion } from 'framer-motion';
import ElementSymbol from './ElementSymbol';

interface ElementGridProps {
  grid: number[][];
  symbols: Array<{
    id: string;
    element: string;
    shape: string;
    color: string;
    value: number;
  }>;
  spinning: boolean;
  winningLines: number[];
  winPatterns: number[][][];
}

const ElementGrid = ({ grid, symbols, spinning, winningLines, winPatterns }: ElementGridProps) => {
  // Check if a cell is part of a winning line
  const isWinningCell = (row: number, col: number): boolean => {
    if (winningLines.length === 0) return false;
    
    return winningLines.some(lineIndex => {
      const pattern = winPatterns[lineIndex];
      return pattern.some(([r, c]) => r === row && c === col);
    });
  };

  return (
    <div className="grid grid-cols-5 grid-rows-5 gap-1 bg-gray-700 p-2 rounded-md">
      {grid.map((row, rowIndex) => (
        row.map((symbolIndex, colIndex) => {
          const symbol = symbols[symbolIndex];
          const isWinning = isWinningCell(rowIndex, colIndex);
          
          return (
            <motion.div 
              key={`${rowIndex}-${colIndex}`}
              className={`relative w-full aspect-square rounded-md flex items-center justify-center overflow-hidden
                ${isWinning && !spinning ? 'bg-gray-600' : 'bg-gray-800'}`}
              animate={
                isWinning && !spinning 
                  ? { 
                      boxShadow: [
                        '0 0 0px rgba(255,255,255,0)', 
                        '0 0 8px rgba(255,215,0,0.7)', 
                        '0 0 0px rgba(255,255,255,0)'
                      ] 
                    } 
                  : {}
              }
              transition={{ duration: 1, repeat: Infinity }}
            >
              {symbol && (
                <ElementSymbol 
                  element={symbol.element}
                  shape={symbol.shape}
                  color={symbol.color}
                  isActive={isWinning && !spinning}
                  isSpinning={spinning}
                />
              )}
            </motion.div>
          );
        })
      ))}
    </div>
  );
};

export default ElementGrid;
