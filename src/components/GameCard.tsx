
import React, { useState, useEffect } from 'react';
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

const GameCard = ({ title, image, isNew, onClick, onEditClick }: GameCardProps) => {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Reset states when image changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
    setRetryCount(0);
  }, [image]);
  
  // Handle image load error
  const handleImageError = () => {
    console.error(`Failed to load image: ${image}`);
    
    // Try to reload the image a few times before giving up
    if (retryCount < 3) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        const imgElement = document.querySelector(`img[src="${image}"]`) as HTMLImageElement;
        if (imgElement) {
          const timestamp = new Date().getTime();
          imgElement.src = `${image}?retry=${timestamp}`;
        }
      }, 1000);
    } else {
      setImageError(true);
    }
  };
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent clicking the card if the edit button is clicked
    if ((e.target as HTMLElement).closest('button[data-edit-button="true"]')) {
      return;
    }
    
    if (onClick) onClick();
  };
  
  // Default image path if image is missing or fails to load
  const fallbackImage = "/placeholder.svg";
  
  // Determine the image source based on error state
  const imageSrc = imageError ? fallbackImage : image;
  
  return (
    <div 
      className="flex flex-col items-center cursor-pointer game-card transition-transform hover:scale-105"
      onClick={handleCardClick}
      style={{ 
        maxWidth: isMobile ? '80px' : '120px',
        width: '100%' 
      }}
    >
      {/* Game image with loading state */}
      <div className="relative rounded-lg overflow-hidden aspect-square w-full">
        {/* New tag at the top */}
        {isNew && (
          <div className="absolute top-1 left-1 bg-orange-500 text-[8px] md:text-xs font-bold text-black px-1 py-0.5 rounded z-10">
            NEW
          </div>
        )}

        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        <img 
          src={imageSrc} 
          alt={title} 
          className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        
        {/* Display title as fallback if image errors */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white text-xs p-1 text-center">
            {title}
          </div>
        )}
        
        {/* Favorite button */}
        <button className="absolute top-1 right-1 text-white opacity-0 transition-opacity hover:opacity-100 focus:opacity-100 favorite-icon">
          <Heart className="h-3 w-3 md:h-4 md:w-4" />
        </button>
        
        {/* Edit button - only shown in admin pages */}
        {onEditClick && (
          <button 
            data-edit-button="true"
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-black p-2 rounded-full z-10 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity edit-button"
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
      </div>

      {/* Game title below image */}
      <div className="mt-1 text-center">
        <h3 className={`${isMobile ? 'text-[10px]' : 'text-xs'} font-medium text-white truncate`}>
          {title}
        </h3>
      </div>

      <style>
        {`
          .game-card:hover .edit-button {
            opacity: 1;
          }
          .game-card:hover .favorite-icon {
            opacity: 1;
          }
        `}
      </style>
    </div>
  );
};

export default GameCard;
