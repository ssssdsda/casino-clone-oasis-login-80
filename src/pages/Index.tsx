import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import Banner from '@/components/Banner';
import PromoBanner from '@/components/PromoBanner';
import GameCategories from '@/components/GameCategories';
import GameSection from '@/components/GameSection';
import Footer from '@/components/Footer';
import { WelcomePopup } from '@/components/WelcomePopup';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/LanguageContext';

// Game data
const featuredGames = [
  {
    id: 'aviator',
    title: 'Aviator',
    image: '/lovable-uploads/7846c04c-50ac-41c6-9f57-9955887f7b06.png',
    isNew: true,
    path: '/game/aviator'
  },
  {
    id: 'boxing-king',
    title: 'Boxing King',
    image: '/lovable-uploads/2b65ebea-23b2-4496-be3c-cc3abe47fa21.png',
    isNew: true,
    path: '/game/boxing-king'
  },
  {
    id: 'casino-win-spin',
    title: 'Casino Win Spin',
    image: '/lovable-uploads/92fab6e1-76fd-48ee-b9ea-819c8f10fef0.png',
    isNew: true,
    path: '/game/spin'
  },
  {
    id: 'mega-spin',
    title: 'Mega Tilt Spin',
    image: '/lovable-uploads/60a4d162-c8e1-4253-bd9c-50266479e10f.png',
    isNew: true,
    path: '/game/megaspin'
  },
  {
    id: 'money-coming',
    title: 'Money Coming',
    image: '/lovable-uploads/7b71f0b4-ac4b-4935-a536-cae4e563a9b4.png',
    isNew: true,
    path: '/game/moneygram'
  },
  {
    id: 'super-ace',
    title: 'Super Ace Casino',
    image: '/lovable-uploads/b84e6d4c-8b32-4ca7-b56a-f0c635d4faca.png',
    isNew: true,
    path: '/game/super-ace'
  },
  {
    id: 'fortune-gems-feat',
    title: 'Fortune Gems',
    image: '/lovable-uploads/2ba68d66-75e6-4a95-a245-e34754d2fc53.png',
    isNew: true,
    path: '/game/fortune-gems'
  },
  {
    id: 'golden-basin-feat',
    title: 'Golden Basin',
    image: '/lovable-uploads/43827a0e-ee9e-4d09-bbe4-cca5b3d5ce4e.png',
    isNew: true,
    path: '/game/golden-basin'
  }
];

const popularGames = [
  {
    id: 'super-ace-popular',
    title: 'Super Ace',
    image: '/lovable-uploads/b84e6d4c-8b32-4ca7-b56a-f0c635d4faca.png',
    path: '/game/super-ace'
  },
  {
    id: 'fortune-gems',
    title: 'Fortune Gems',
    image: '/lovable-uploads/2ba68d66-75e6-4a95-a245-e34754d2fc53.png',
    path: '/game/fortune-gems'
  },
  {
    id: 'coin-up',
    title: 'Coin Up',
    image: '/lovable-uploads/8b1e75c0-b325-49af-ac43-3a0f0af41cba.png',
    isNew: true,
    path: '/game/coin-up'
  },
  {
    id: 'aviator-popular',
    title: 'Aviator',
    image: '/lovable-uploads/7846c04c-50ac-41c6-9f57-9955887f7b06.png',
    path: '/game/aviator'
  },
  {
    id: 'tiger-rush',
    title: 'Tiger Rush',
    image: '/placeholder.svg',
  },
  {
    id: 'golden-basin',
    title: 'Golden Basin',
    image: '/lovable-uploads/43827a0e-ee9e-4d09-bbe4-cca5b3d5ce4e.png',
    path: '/game/golden-basin'
  },
  {
    id: '777coins',
    title: '777 Coins',
    image: '/placeholder.svg',
    path: '/game/777coins'
  },
  {
    id: 'mega-spin-pop',
    title: 'Mega Tilt Spin',
    image: '/lovable-uploads/60a4d162-c8e1-4253-bd9c-50266479e10f.png',
    path: '/game/megaspin'
  },
];

const slotGames = [
  {
    id: 'mega-spin-slot',
    title: 'Mega Tilt Spin',
    image: '/lovable-uploads/60a4d162-c8e1-4253-bd9c-50266479e10f.png',
    path: '/game/megaspin'
  },
  {
    id: 'lucky-heroes',
    title: 'Lucky Heroes',
    image: '/placeholder.svg',
  },
  {
    id: 'golden-wheel',
    title: 'Golden Wheel',
    image: '/placeholder.svg',
  },
  {
    id: 'diamond-rush',
    title: 'Diamond Rush',
    image: '/placeholder.svg',
  },
  {
    id: 'fortune-gems-slot',
    title: 'Fortune Gems',
    image: '/lovable-uploads/2ba68d66-75e6-4a95-a245-e34754d2fc53.png',
    isNew: true,
    path: '/game/fortune-gems'
  },
  {
    id: 'coin-up-slot',
    title: 'Coin Up',
    image: '/lovable-uploads/8b1e75c0-b325-49af-ac43-3a0f0af41cba.png',
    isNew: true,
    path: '/game/coin-up'
  },
  {
    id: 'golden-basin-slot',
    title: 'Golden Basin',
    image: '/lovable-uploads/43827a0e-ee9e-4d09-bbe4-cca5b3d5ce4e.png',
    isNew: true,
    path: '/game/golden-basin'
  },
  {
    id: '777coins-slot',
    title: '777 Coins',
    image: '/placeholder.svg',
    path: '/game/777coins'
  },
];

const liveGames = [
  {
    id: 'live-cricket',
    title: 'Live Cricket',
    image: '/placeholder.svg',
    isNew: true,
    path: '/game/live-cricket'
  },
  {
    id: 'live-football',
    title: 'Live Football',
    image: '/placeholder.svg',
    isNew: true,
    path: '/game/live-football'
  },
  {
    id: 'live-baccarat',
    title: 'Live Baccarat',
    image: '/placeholder.svg',
  },
];

const casinoGames = [
  {
    id: 'royal-poker',
    title: 'Royal Poker',
    image: '/placeholder.svg',
  },
  {
    id: 'blackjack-pro',
    title: 'Blackjack Pro',
    image: '/placeholder.svg',
  },
  {
    id: 'roulette-master',
    title: 'Roulette Master',
    image: '/placeholder.svg',
    isNew: true,
  },
  {
    id: 'boxing-king-casino',
    title: 'Boxing King',
    image: '/lovable-uploads/2b65ebea-23b2-4496-be3c-cc3abe47fa21.png',
    isNew: true,
    path: '/game/boxing-king'
  }
];

// Define all game categories for filtering
const gameCategories: Record<string, any[]> = {
  featuredGames,
  popularGames,
  slots: slotGames,
  liveGames,
  tableGames: casinoGames,
  sports: [],
  fishing: [],
  arcade: []
};

const Index = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add a loading state to ensure images have time to load
  useEffect(() => {
    // Allow time for images to preload
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };
  
  // If still loading, show a simple loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen bg-casino-dark flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-white">Loading games...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <PromoBanner />
      <div className="flex flex-1">
        {!isMobile && <CategorySidebar onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />}
        <main className={`flex-1 p-1 md:p-4 overflow-y-auto ${isMobile ? 'pb-16' : ''}`}>
          <GameCategories onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
          <div className="mt-2 md:mt-4 space-y-2 md:space-y-4">
            {selectedCategory ? (
              <GameSection 
                title={selectedCategory} 
                games={gameCategories[selectedCategory] || []} 
              />
            ) : (
              <>
                <GameSection title="featuredGames" games={featuredGames} />
                <GameSection title="popularGames" games={popularGames} />
                <GameSection title="slots" games={slotGames} />
                <GameSection title="liveGames" games={liveGames} />
                <GameSection title="tableGames" games={casinoGames} />
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
      <WelcomePopup />
    </div>
  );
};

export default Index;
