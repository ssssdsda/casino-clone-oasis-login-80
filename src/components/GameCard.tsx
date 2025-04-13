
import React from 'react';
import { Heart } from 'lucide-react';

interface GameCardProps {
  id: string;
  title: string;
  image: string;
  isNew?: boolean;
  multiplier?: string;
}

const GameCard: React.FC<GameCardProps> = ({ id, title, image, isNew, multiplier }) => {
  return (
    <div className="game-card relative rounded-lg overflow-hidden group cursor-pointer">
      <div className="relative aspect-[3/4] max-w-[200px] mx-auto overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-50" />
        
        {/* Favorite button */}
        <button className="favorite-icon absolute top-2 right-2 w-8 h-8 rounded-full bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart className="h-4 w-4 text-white" />
        </button>
        
        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-medium text-white truncate">{title}</h3>
        </div>
        
        {/* New badge */}
        {isNew && (
          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs py-1 px-2 rounded">
            NEW
          </div>
        )}
        
        {/* Multiplier */}
        {multiplier && (
          <div className="absolute top-2 left-2 bg-casino-accent text-black font-bold text-xs py-1 px-2 rounded">
            {multiplier}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;
