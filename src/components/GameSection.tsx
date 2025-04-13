
import React from 'react';
import GameCard from './GameCard';

interface Game {
  id: string;
  title: string;
  image: string;
  multiplier?: string;
  isNew?: boolean;
}

interface GameSectionProps {
  title: string;
  games: Game[];
}

const GameSection = ({ title, games }: GameSectionProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-bold text-white">{title}</h2>
        <button className="text-xs text-casino-accent font-semibold">
          View All
        </button>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {games.map((game) => (
          <GameCard 
            key={game.id}
            id={game.id}
            title={game.title}
            image={game.image}
            multiplier={game.multiplier}
            isNew={game.isNew}
            onClick={() => console.log(`Clicked game: ${game.title}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameSection;
