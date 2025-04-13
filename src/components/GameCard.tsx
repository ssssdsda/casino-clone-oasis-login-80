
import React from 'react';
import { Heart } from 'lucide-react';

interface GameCardProps {
  id: string;
  title: string;
  image: string;
  multiplier?: string;
  isNew?: boolean;
  onClick?: () => void;
}

const GameCard = ({ title, image, multiplier, isNew, onClick }: GameCardProps) => {
  return (
    <div 
      className="relative rounded-lg overflow-hidden cursor-pointer game-card transition-transform hover:scale-105"
      onClick={onClick}
      style={{ maxWidth: '160px' }}
    >
      {/* Game image */}
      <div className="aspect-[3/4] relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Game title and info */}
        <div className="absolute bottom-0 left-0 right-0 p-2">
          <h3 className="text-sm font-medium text-white">{title}</h3>
          {multiplier && (
            <div className="text-xs text-casino-accent font-bold mt-1">
              Win up to {multiplier}
            </div>
          )}
        </div>
        
        {/* Favorite button */}
        <button className="absolute top-2 right-2 text-white opacity-0 transition-opacity favorite-icon">
          <Heart className="h-4 w-4" />
        </button>
        
        {/* New tag */}
        {isNew && (
          <div className="absolute top-2 left-2 bg-casino-accent text-xs font-bold text-black px-2 py-0.5 rounded">
            NEW
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;
