
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryProps {
  icon: string;
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
        <img src={icon} alt={label} className="w-6 h-6 md:w-8 md:h-8" />
      </div>
      <span className="text-xs md:text-sm font-medium text-white text-center">{label}</span>
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
      id: 'slots', 
      icon: '/placeholder.svg', 
      label: t('slots')
    },
    { 
      id: 'liveGames', 
      icon: '/placeholder.svg', 
      label: t('liveGames') 
    },
    { 
      id: 'sports', 
      icon: '/placeholder.svg',
      label: t('sportsGames') 
    },
    {
      id: 'tableGames',
      icon: '/placeholder.svg',
      label: t('tableGames')
    },
    {
      id: 'fishing',
      icon: '/placeholder.svg',
      label: t('fishingGames')
    },
    {
      id: 'arcade',
      icon: '/placeholder.svg',
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
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-4 mb-4 px-1">
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
