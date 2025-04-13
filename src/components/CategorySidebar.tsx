
import React from 'react';
import { 
  Flame, Gift, Gamepad2, Joystick, Heart, Trophy, 
  Dice5, Download, Coins, DollarSign, CircleDollarSign 
} from 'lucide-react';

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
      className={`flex flex-col items-center justify-center w-full p-4 rounded-md transition-colors ${
        isActive ? 'bg-casino text-casino-accent' : 'text-gray-300 hover:bg-casino hover:bg-opacity-50'
      }`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

const CategorySidebar: React.FC = () => {
  const [activeCategory, setActiveCategory] = React.useState('popular');

  const categories = [
    { id: 'popular', icon: <Flame size={24} />, label: 'Popular' },
    { id: 'slots', icon: <Coins size={24} />, label: 'Slots' },
    { id: 'live', icon: <Heart size={24} />, label: 'Live Casino' },
    { id: 'sports', icon: <Trophy size={24} />, label: 'Sports' },
    { id: 'card', icon: <Dice5 size={24} />, label: 'Card Games' },
    { id: 'arcade', icon: <Gamepad2 size={24} />, label: 'Arcade' },
    { id: 'fish', icon: <Joystick size={24} />, label: 'Fishing' },
    { id: 'bonus', icon: <Gift size={24} />, label: 'Bonus' },
    { id: 'vip', icon: <DollarSign size={24} />, label: 'VIP' },
    { id: 'download', icon: <Download size={24} />, label: 'Download' },
  ];

  return (
    <div className="hidden sm:block w-24 bg-casino-dark border-r border-gray-800">
      <div className="grid grid-cols-1 gap-2 p-2">
        {categories.map((category) => (
          <Category
            key={category.id}
            icon={category.icon}
            label={category.label}
            isActive={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default CategorySidebar;
