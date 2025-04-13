
import React from 'react';
import GameCard from './GameCard';
import { ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface GameSectionProps {
  title: string;
  games: {
    id: string;
    title: string;
    image: string;
    isNew?: boolean;
    multiplier?: string;
  }[];
  viewMore?: boolean;
}

const GameSection: React.FC<GameSectionProps> = ({ title, games, viewMore = true }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {viewMore && (
          <Button variant="link" className="text-casino-accent flex items-center">
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {games.map((game) => (
          <GameCard 
            key={game.id}
            id={game.id}
            title={game.title}
            image={game.image}
            isNew={game.isNew}
            multiplier={game.multiplier}
          />
        ))}
      </div>
    </div>
  );
};

export default GameSection;
