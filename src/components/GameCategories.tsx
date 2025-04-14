
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Coins, 
  Heart, 
  Trophy, 
  Dice5, 
  Gamepad2, 
  Joystick,
  Flame
} from 'lucide-react';

interface CategoryProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isSelected?: boolean;
}

const GameCategory = ({ icon, label, onClick, isSelected }: CategoryProps) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer hover:bg-opacity-80 transition-all ${
        isSelected ? 'bg-casino-accent' : 'bg-casino'
      }`}
      onClick={onClick}
    >
      <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full mb-2 ${
        isSelected ? 'bg-casino' : 'bg-casino-accent'
      }`}>
        {icon}
      </div>
      <span className="text-xs md:text-sm font-medium text-white text-center truncate w-full">{label}</span>
    </div>
  );
};

interface GameCategoriesProps {
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string | null;
}

const GameCategories = ({ onCategorySelect, selectedCategory }: GameCategoriesProps) => {
  const { t } = useLanguage();
  
  const categories = [
    { 
      id: 'featuredGames',
      icon: <Flame className="w-6 h-6 md:w-8 md:h-8 text-white" />, 
      label: t('featuredGames')
    },
    { 
      id: 'slots', 
      icon: <Coins className="w-6 h-6 md:w-8 md:h-8 text-white" />, 
      label: t('slots')
    },
    { 
      id: 'liveGames', 
      icon: <Heart className="w-6 h-6 md:w-8 md:h-8 text-white" />, 
      label: t('liveGames') 
    },
    { 
      id: 'sports', 
      icon: <Trophy className="w-6 h-6 md:w-8 md:h-8 text-white" />, 
      label: t('sportsGames') 
    },
    {
      id: 'tableGames',
      icon: <Dice5 className="w-6 h-6 md:w-8 md:h-8 text-white" />,
      label: t('tableGames')
    },
    {
      id: 'fishing',
      icon: <Joystick className="w-6 h-6 md:w-8 md:h-8 text-white" />,
      label: t('fishingGames')
    },
    {
      id: 'arcade',
      icon: <Gamepad2 className="w-6 h-6 md:w-8 md:h-8 text-white" />,
      label: t('arcadeGames')
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    } else {
      console.log(`Category clicked: ${categoryId}`);
    }
  };

  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 md:gap-4 mb-4 px-1">
      {categories.map((category) => (
        <GameCategory
          key={category.id}
          icon={category.icon}
          label={category.label}
          isSelected={selectedCategory === category.id}
          onClick={() => handleCategoryClick(category.id)}
        />
      ))}
    </div>
  );
};

export default GameCategories;
