
import React from 'react';
import GameCard from './GameCard';
import { useLanguage } from '@/context/LanguageContext';

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
  
  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-md md:text-lg font-bold text-white">{t(title)}</h2>
        <button className="text-xs text-casino-accent font-semibold">
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5">
        {games.map((game) => (
          <GameCard 
            key={game.id}
            id={game.id}
            title={game.title}
            image={game.image}
            multiplier={game.multiplier}
            isNew={game.isNew}
            onClick={() => {
              if (game.path) {
                window.location.href = game.path;
              } else {
                console.log(`Clicked game: ${game.title}`);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GameSection;
