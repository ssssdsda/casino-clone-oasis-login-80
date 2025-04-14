
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
  onEditClick?: (e: React.MouseEvent) => void;
}

const GameCard = ({ title, image, multiplier, isNew, onClick, onEditClick }: GameCardProps) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent clicking the card if the edit button is clicked
    if ((e.target as HTMLElement).closest('button[data-edit-button="true"]')) {
      return;
    }
    
    if (onClick) onClick();
  };
  
  return (
    <div 
      className="relative rounded-lg overflow-hidden cursor-pointer game-card transition-transform hover:scale-105"
      onClick={handleCardClick}
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
        <button className="absolute top-1 right-1 text-white opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 favorite-icon">
          <Heart className="h-3 w-3 md:h-4 md:w-4" />
        </button>
        
        {/* Edit button - only shown in admin pages */}
        {onEditClick && (
          <button 
            data-edit-button="true"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-casino-accent text-black p-2 rounded-full z-10 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity edit-button"
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(e);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        )}
        
        {/* New tag */}
        {isNew && (
          <div className="absolute top-1 left-1 bg-casino-accent text-[8px] md:text-xs font-bold text-black px-1 py-0.5 rounded">
            NEW
          </div>
        )}
      </div>

      <style>
        {`
          .game-card:hover .edit-button {
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
};

export default GameCard;
