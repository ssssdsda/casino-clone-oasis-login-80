import React from 'react';
import { motion, Variants } from 'framer-motion';

// Define the symbol types
type SymbolShape = 'circle' | 'triangle' | 'diamond' | 'hexagon' | 'star';

interface ElementSymbolProps {
  element: string;
  shape: string;
  color: string;
  size?: number;
  isActive?: boolean;
  isSpinning?: boolean;
}

const ElementSymbol = ({ element, shape, color, size = 60, isActive = false, isSpinning = false }: ElementSymbolProps) => {
  // Function to render the appropriate SVG shape
  const renderShape = () => {
    switch (shape) {
      case 'circle':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill={color} stroke="#888" strokeWidth="4" />
            {renderElementIcon()}
          </svg>
        );
      case 'triangle':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon 
              points="50,10 90,90 10,90" 
              fill={color} 
              stroke="#888" 
              strokeWidth="4" 
            />
            {renderElementIcon()}
          </svg>
        );
      case 'diamond':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon 
              points="50,10 90,50 50,90 10,50" 
              fill={color} 
              stroke="#888" 
              strokeWidth="4" 
            />
            {renderElementIcon()}
          </svg>
        );
      case 'hexagon':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon 
              points="25,10 75,10 95,50 75,90 25,90 5,50" 
              fill={color} 
              stroke="#888" 
              strokeWidth="4" 
            />
            {renderElementIcon()}
          </svg>
        );
      case 'star':
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <polygon 
              points="50,10 61,35 90,35 65,55 75,80 50,65 25,80 35,55 10,35 39,35" 
              fill="#FFCC00" 
              stroke="#888" 
              strokeWidth="2" 
            />
            <text 
              x="50" 
              y="60" 
              textAnchor="middle" 
              fontSize="30" 
              fontWeight="bold" 
              fill="#FF4500"
            >
              W
            </text>
          </svg>
        );
      default:
        return (
          <svg width={size} height={size} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill={color} stroke="#888" strokeWidth="4" />
            {renderElementIcon()}
          </svg>
        );
    }
  };

  // Function to render the element icon inside the shape
  const renderElementIcon = () => {
    switch(element) {
      case 'water':
        return (
          <path 
            d="M50,25 C60,45 70,55 70,70 C70,85 60,95 50,95 C40,95 30,85 30,70 C30,55 40,45 50,25 Z" 
            fill="#FFFFFF" 
            fillOpacity="0.7" 
          />
        );
      case 'fire':
        return (
          <path 
            d="M50,20 C60,35 75,45 75,65 C75,85 65,95 50,95 C35,95 25,85 25,65 C25,55 30,50 35,45 C35,60 45,65 45,55 C45,45 50,35 50,20 Z" 
            fill="#FFFFFF" 
            fillOpacity="0.7" 
          />
        );
      case 'lightning':
        return (
          <path 
            d="M55,20 L30,50 L45,50 L40,80 L65,50 L50,50 L55,20 Z" 
            fill="#FFFFFF" 
            fillOpacity="0.7" 
          />
        );
      case 'earth':
        return (
          <path 
            d="M30,40 L70,40 L70,70 L30,70 Z M40,50 L60,50 L60,60 L40,60 Z" 
            fill="#FFFFFF" 
            fillOpacity="0.7" 
          />
        );
      case 'wind':
        return (
          <g fill="#FFFFFF" fillOpacity="0.7">
            <path d="M30,35 L70,35 L70,45 L30,45 Z" />
            <path d="M40,50 L80,50 L80,60 L40,60 Z" />
            <path d="M30,65 L60,65 L60,75 L30,75 Z" />
          </g>
        );
      default:
        return null;
    }
  };

  // Animation variants - properly typed for framer-motion
  const variants: Variants = {
    idle: { 
      scale: 1 
    },
    active: { 
      scale: [1, 1.1, 1], 
      rotate: [0, 5, -5, 0],
      transition: { 
        duration: 1, 
        repeat: Infinity,
        repeatType: "reverse" as const // Explicitly typed as a const literal
      } 
    },
    spinning: {
      rotate: [0, 360],
      scale: [1, 0.8, 1],
      transition: { 
        duration: 0.5,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div
      className="flex items-center justify-center"
      animate={isSpinning ? "spinning" : isActive ? "active" : "idle"}
      variants={variants}
      style={{
        filter: `drop-shadow(0 0 4px ${color})`,
        width: size,
        height: size,
      }}
    >
      <div className="relative w-full h-full">
        {/* Background stone/tile effect */}
        <div 
          className="absolute inset-0 rounded-md bg-gradient-to-b from-gray-300 to-gray-500"
          style={{
            boxShadow: '2px 2px 4px rgba(0,0,0,0.3), inset 1px 1px 1px rgba(255,255,255,0.5)'
          }}
        />
        
        <div className="absolute inset-2 flex items-center justify-center">
          {renderShape()}
        </div>
        
        {isActive && (
          <motion.div 
            className="absolute inset-0 rounded-md"
            animate={{ 
              boxShadow: [
                '0 0 5px rgba(255,255,255,0.5)', 
                '0 0 15px rgba(255,255,255,0.8)', 
                '0 0 5px rgba(255,255,255,0.5)'
              ],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>
    </motion.div>
  );
};

export default ElementSymbol;
