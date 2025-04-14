
import React from 'react';
import { 
  Flame, Gift, Gamepad2, Joystick, Heart, Trophy, 
  Dice5, Download, Coins, DollarSign, CircleDollarSign 
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const Category: React.FC<CategoryProps> = ({ icon, label, isActive = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full p-3 rounded-md transition-colors ${
        isActive ? 'bg-casino text-casino-accent' : 'text-gray-300 hover:bg-casino hover:bg-opacity-50'
      }`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

interface CategorySidebarProps {
  onCategorySelect?: (categoryId: string) => void;
  selectedCategory?: string | null;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({ onCategorySelect, selectedCategory }) => {
  const [activeCategory, setActiveCategory] = React.useState(selectedCategory || 'popularGames');
  const { t } = useLanguage();

  const categories = [
    { id: 'popularGames', icon: <Flame size={22} />, label: t('popularGames') },
    { id: 'slots', icon: <Coins size={22} />, label: t('slots') },
    { id: 'liveGames', icon: <Heart size={22} />, label: t('liveGames') },
    { id: 'sports', icon: <Trophy size={22} />, label: t('sportsGames') },
    { id: 'tableGames', icon: <Dice5 size={22} />, label: t('tableGames') },
    { id: 'arcade', icon: <Gamepad2 size={22} />, label: t('arcadeGames') },
    { id: 'fishing', icon: <Joystick size={22} />, label: t('fishingGames') },
    { id: 'bonus', icon: <Gift size={22} />, label: 'Bonus' },
    { id: 'vip', icon: <DollarSign size={22} />, label: 'VIP' },
    { id: 'download', icon: <Download size={22} />, label: 'Download' },
  ];

  // Update active category when selectedCategory changes from props
  React.useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory);
    }
  }, [selectedCategory]);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  return (
    <div className="hidden sm:block w-24 bg-casino-dark border-r border-gray-800">
      <div className="grid grid-cols-1 gap-1 p-2">
        {categories.map((category) => (
          <Category
            key={category.id}
            icon={category.icon}
            label={category.label}
            isActive={activeCategory === category.id}
            onClick={() => handleCategoryClick(category.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySidebar;
