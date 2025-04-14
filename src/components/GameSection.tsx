
import React, { useEffect, useState, useCallback } from 'react';
import GameCard from './GameCard';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface Game {
  id: string;
  title: string;
  image: string;
  multiplier?: string;
  isNew?: boolean;
  path?: string;
}

interface GameSectionProps {
  title: string;
  games: Game[];
  isAdmin?: boolean;
  onEditGame?: (game: Game) => void;
}

const GameSection = ({ title, games: propGames, isAdmin = false, onEditGame }: GameSectionProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [games, setGames] = useState<Game[]>(propGames);
  const [visibleGames, setVisibleGames] = useState<Game[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  
  // Preload all game images to improve performance
  const preloadImages = useCallback(() => {
    if (imagesPreloaded || !games.length) return;
    
    const imagePromises = games.map(game => {
      return new Promise((resolve, reject) => {
        if (!game.image) {
          resolve(null);
          return;
        }
        
        const img = new Image();
        img.src = game.image;
        img.onload = () => resolve(img);
        img.onerror = () => {
          console.error(`Failed to preload image: ${game.image}`);
          resolve(null);
        };
      });
    });
    
    Promise.all(imagePromises).then(() => {
      setImagesPreloaded(true);
    });
  }, [games, imagesPreloaded]);
  
  // Update games when propGames changes
  useEffect(() => {
    setGames(propGames);
    
    // Only show first few games initially for better performance
    const initialGameCount = isMobile ? 6 : 8;
    setVisibleGames(propGames.slice(0, initialGameCount));
    setShowAll(propGames.length <= initialGameCount);
    
    // Reset preloaded state when games change
    setImagesPreloaded(false);
    
    // Start preloading images using Intersection Observer API
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          preloadImages();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    // Create a dummy element to observe
    const dummyEl = document.createElement('div');
    if (document.body) {
      document.body.appendChild(dummyEl);
      observer.observe(dummyEl);
      
      return () => {
        observer.disconnect();
        if (document.body.contains(dummyEl)) {
          document.body.removeChild(dummyEl);
        }
      };
    }
    
    return () => {};
  }, [propGames, isMobile, preloadImages]);
  
  const handleGameClick = (game: Game) => {
    if (game.path) {
      navigate(game.path);
    } else {
      console.log(`Clicked game: ${game.title}`);
    }
  };
  
  const handleEditClick = (game: Game) => {
    if (onEditGame) {
      onEditGame(game);
    }
  };
  
  const handleViewAll = () => {
    setVisibleGames(games);
    setShowAll(true);
  };
  
  // If there are no games to display, don't render the section
  if (games.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-md md:text-xl font-bold text-white">{t(title)}</h2>
        {!showAll && games.length > visibleGames.length && (
          <button 
            className="text-xs md:text-sm text-orange-500 font-semibold"
            onClick={handleViewAll}
          >
            View All
          </button>
        )}
      </div>
      
      <div className="flex justify-center w-full">
        <div className={`grid ${isMobile 
          ? 'grid-cols-3 gap-2' 
          : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-8 gap-2 md:gap-4'} justify-items-center`}>
          {visibleGames.map((game) => (
            <GameCard 
              key={game.id}
              id={game.id}
              title={game.title}
              image={game.image}
              multiplier={game.multiplier}
              isNew={game.isNew}
              onClick={() => handleGameClick(game)}
              onEditClick={isAdmin ? () => handleEditClick(game) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameSection;
