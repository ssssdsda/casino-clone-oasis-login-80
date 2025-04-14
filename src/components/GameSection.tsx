
import React from 'react';
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
}

const GameSection = ({ title, games }: GameSectionProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const handleGameClick = (game: Game) => {
    if (game.path) {
      navigate(game.path);
    } else {
      console.log(`Clicked game: ${game.title}`);
    }
  };
  
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-md md:text-xl font-bold text-white">{t(title)}</h2>
        <button className="text-xs md:text-sm text-casino-accent font-semibold">
          View All
        </button>
      </div>
      
      <div className="flex justify-center">
        <div className={`grid ${isMobile 
          ? 'grid-cols-3 gap-2' 
          : 'grid-cols-5 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-4'}`}>
          {games.map((game) => (
            <GameCard 
              key={game.id}
              id={game.id}
              title={game.title}
              image={game.image}
              multiplier={game.multiplier}
              isNew={game.isNew}
              onClick={() => handleGameClick(game)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameSection;
