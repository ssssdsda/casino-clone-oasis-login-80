
import React, { useEffect, useState, useCallback } from 'react';
import GameCard from './GameCard';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

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
  const [games, setGames] = useState<Game[]>([]);
  const [visibleGames, setVisibleGames] = useState<Game[]>([]);
  const [showAll, setShowAll] = useState(false);
  
  // Helper function to ensure image paths are valid
  const validateImagePath = (path: string) => {
    if (!path) return '/placeholder.svg';
    
    // Check if path starts with http/https or /lovable-uploads or /placeholder.svg
    if (path.startsWith('http://') || path.startsWith('https://') || 
        path.startsWith('/lovable-uploads') || path.startsWith('/placeholder')) {
      return path;
    }
    
    // Otherwise, assume it should be in lovable-uploads and fix it
    if (path.startsWith('/')) {
      return path;
    }
    
    return `/lovable-uploads/${path}`;
  };
  
  // Update games when propGames changes
  useEffect(() => {
    if (!propGames || propGames.length === 0) {
      setGames([]);
      setVisibleGames([]);
      return;
    }
    
    console.log("Original games data:", propGames);
    
    // Validate each game to ensure it has required properties
    const validGames = propGames.map(game => {
      // Ensure each game has an ID
      const gameId = game.id || `game-${Math.random().toString(36).substr(2, 9)}`;
      
      // Validate and fix image path
      const gameImage = validateImagePath(game.image);
      
      console.log(`Game: ${game.title}, Original image: ${game.image}, Validated image: ${gameImage}`);
      
      return {
        ...game,
        id: gameId,
        image: gameImage
      };
    });
    
    console.log("Validated games data:", validGames);
    
    setGames(validGames);
    
    // Only show first few games initially for better performance
    const initialGameCount = isMobile ? 6 : 8;
    setVisibleGames(validGames.slice(0, initialGameCount));
    setShowAll(validGames.length <= initialGameCount);
    
  }, [propGames, isMobile]);
  
  const handleGameClick = (game: Game) => {
    console.log(`Clicked game: ${game.title} with path: ${game.path}`);
    
    if (game.path) {
      navigate(game.path);
    } else {
      console.log(`No path defined for game: ${game.title}`);
      toast(`${game.title} clicked`, {
        description: "Game coming soon",
        position: "bottom-center"
      });
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
