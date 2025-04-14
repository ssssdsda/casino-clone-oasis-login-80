
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
    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-md md:text-lg font-bold text-white">{t(title)}</h2>
        <button className="text-xs text-casino-accent font-semibold">
          View All
        </button>
      </div>
      
      <div className={`grid ${isMobile ? 'grid-cols-4 gap-1' : 'grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-10 gap-1.5'}`}>
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
  );
};

export default GameSection;
