
import React, { useEffect, useState } from 'react';
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
  
  // Update games when propGames changes
  useEffect(() => {
    setGames(propGames);
  }, [propGames]);
  
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
  
  // If there are no games to display, don't render the section
  if (games.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-md md:text-xl font-bold text-white">{t(title)}</h2>
        <button className="text-xs md:text-sm text-orange-500 font-semibold">
          View All
        </button>
      </div>
      
      <div className="flex justify-center w-full">
        <div className={`grid ${isMobile 
          ? 'grid-cols-3 gap-2' 
          : 'grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-8 gap-4'} justify-items-center`}>
          {games.map((game) => (
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
