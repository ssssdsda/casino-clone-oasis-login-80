
import React from 'react';
import { Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface GameCardProps {
  id: string;
  title: string;
  image: string;
  multiplier?: string;
  isNew?: boolean;
  onClick?: () => void;
}

const GameCard = ({ title, image, multiplier, isNew, onClick }: GameCardProps) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  return (
    <div 
      className="relative rounded-lg overflow-hidden cursor-pointer game-card transition-transform hover:scale-105"
      onClick={onClick}
      style={{ 
        maxWidth: isMobile ? '100px' : '140px',
        width: '100%' 
      }}
    >
      {/* Game image */}
      <div className="aspect-[3/4] relative">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Game title and info */}
        <div className="absolute bottom-0 left-0 right-0 p-1.5">
          <h3 className={`${isMobile ? 'text-[10px]' : 'text-xs md:text-sm'} font-medium text-white truncate`}>
            {title}
          </h3>
          {multiplier && (
            <div className={`${isMobile ? 'text-[9px]' : 'text-[10px] md:text-xs'} text-casino-accent font-bold`}>
              {t('currency')}{multiplier}
            </div>
          )}
        </div>
        
        {/* Favorite button */}
        <button className="absolute top-1 right-1 text-white opacity-0 transition-opacity favorite-icon">
          <Heart className="h-3 w-3 md:h-4 md:w-4" />
        </button>
        
        {/* New tag */}
        {isNew && (
          <div className="absolute top-1 left-1 bg-casino-accent text-[8px] md:text-xs font-bold text-black px-1 py-0.5 rounded">
            NEW
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;
