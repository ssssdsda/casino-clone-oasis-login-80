
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
    multiplier: '100000',
    isNew: true,
    path: '/game/aviator'
  },
  {
    id: 'boxing-king',
    title: 'Boxing King',
    image: '/lovable-uploads/23ba5110-65e1-4f2e-8330-95f1a62d130d.png',
    multiplier: '50000',
    isNew: true,
    path: '/game/boxing-king'
  },
  {
    id: 'casino-win-spin',
    title: 'Casino Win Spin',
    image: '/lovable-uploads/92fab6e1-76fd-48ee-b9ea-819c8f10fef0.png',
    multiplier: '20000',
    isNew: true,
    path: '/game/spin'
  },
  {
    id: 'mega-spin',
    title: 'Mega Spin',
    image: '/lovable-uploads/81311ba9-9029-4f01-a93f-e692e7659216.png',
    multiplier: '40000',
    isNew: true,
    path: '/game/megaspin'
  },
  {
    id: 'money-coming',
    title: 'Money Coming',
    image: '/lovable-uploads/7b71f0b4-ac4b-4935-a536-cae4e563a9b4.png',
    multiplier: '30000',
    isNew: true,
    path: '/game/moneygram'
  },
  {
    id: 'super-ace',
    title: 'Super Ace Casino',
    image: '/lovable-uploads/b84e6d4c-8b32-4ca7-b56a-f0c635d4faca.png',
    multiplier: '25000',
    isNew: true,
    path: '/game/super-ace'
  },
  {
    id: 'fortune-gems-feat',
    title: 'Fortune Gems',
    image: '/lovable-uploads/2ba68d66-75e6-4a95-a245-e34754d2fc53.png',
    multiplier: '35000',
    isNew: true,
    path: '/game/fortune-gems'
  },
  {
    id: 'golden-basin-feat',
    title: 'Golden Basin',
    image: '/lovable-uploads/43827a0e-ee9e-4d09-bbe4-cca5b3d5ce4e.png',
    multiplier: '45000',
    isNew: true,
    path: '/game/golden-basin'
  }
];

const popularGames = [
  {
    id: '1',
    title: 'Super Ace',
    image: '/lovable-uploads/b84e6d4c-8b32-4ca7-b56a-f0c635d4faca.png',
    multiplier: '2000',
    path: '/game/super-ace'
  },
  {
    id: 'fortune-gems',
    title: 'Fortune Gems',
    image: '/lovable-uploads/2ba68d66-75e6-4a95-a245-e34754d2fc53.png',
    multiplier: '3500',
    path: '/game/fortune-gems'
  },
  {
    id: 'coin-up',
    title: 'Coin Up',
    image: '/lovable-uploads/8b1e75c0-b325-49af-ac43-3a0f0af41cba.png',
    multiplier: '5000',
    isNew: true,
    path: '/game/coin-up'
  },
  {
    id: 'aviator-popular',
    title: 'Aviator',
    image: '/lovable-uploads/7846c04c-50ac-41c6-9f57-9955887f7b06.png',
    multiplier: '8000',
    path: '/game/aviator'
  },
  {
    id: '5',
    title: 'Tiger Rush',
    image: '/lovable-uploads/a6514654-403c-4313-a1ba-72241116b3e6.png',
    multiplier: '3000',
  },
  {
    id: 'golden-basin',
    title: 'Golden Basin',
    image: '/lovable-uploads/43827a0e-ee9e-4d09-bbe4-cca5b3d5ce4e.png',
    multiplier: '4500',
    path: '/game/golden-basin'
  },
  {
    id: '777coins',
    title: '777 Coins',
    image: '/lovable-uploads/a6514654-403c-4313-a1ba-72241116b3e6.png',
    multiplier: '3200',
    path: '/game/777coins'
  },
  {
    id: 'mega-spin-pop',
    title: 'Mega Spin',
    image: '/lovable-uploads/81311ba9-9029-4f01-a93f-e692e7659216.png',
    multiplier: '4000',
    path: '/game/megaspin'
  },
];

const slotGames = [
  {
    id: 'mega-spin-slot',
    title: 'Mega Spin',
    image: '/lovable-uploads/81311ba9-9029-4f01-a93f-e692e7659216.png',
    path: '/game/megaspin'
  },
  {
    id: '7',
    title: 'Lucky Heroes',
    image: '/lovable-uploads/a6514654-403c-4313-a1ba-72241116b3e6.png',
    multiplier: '2600',
  },
  {
    id: '8',
    title: 'Golden Wheel',
    image: '/lovable-uploads/a6514654-403c-4313-a1ba-72241116b3e6.png',
  },
  {
    id: '9',
    title: 'Diamond Rush',
    image: '/lovable-uploads/a6514654-403c-4313-a1ba-72241116b3e6.png',
    multiplier: '1800',
  },
  {
    id: 'fortune-gems',
    title: 'Fortune Gems',
    image: '/lovable-uploads/2ba68d66-75e6-4a95-a245-e34754d2fc53.png',
    multiplier: '3500',
    isNew: true,
    path: '/game/fortune-gems'
  },
  {
    id: 'coin-up',
    title: 'Coin Up',
    image: '/lovable-uploads/8b1e75c0-b325-49af-ac43-3a0f0af41cba.png',
    multiplier: '5000',
    isNew: true,
    path: '/game/coin-up'
  },
  {
    id: 'golden-basin',
    title: 'Golden Basin',
    image: '/lovable-uploads/43827a0e-ee9e-4d09-bbe4-cca5b3d5ce4e.png',
    multiplier: '4500',
    isNew: true,
    path: '/game/golden-basin'
  },
  {
    id: '777coins-slot',
    title: '777 Coins',
    image: '/lovable-uploads/a6514654-403c-4313-a1ba-72241116b3e6.png',
    multiplier: '3200',
    path: '/game/777coins'
  },
];

const liveGames = [
  {
    id: '11',
    title: 'Live Cricket',
    image: '/lovable-uploads/a6514654-403c-4313-a1ba-72241116b3e6.png',
    isNew: true,
    path: '/game/live-cricket'
  },
  {
    id: '12',
    title: 'Live Football',
    image: '/lovable-uploads/a6514654-403c-4313-a1ba-72241116b3e6.png',
    isNew: true,
    path: '/game/live-football'
  },
  {
    id: '13',
    title: 'Live Baccarat',
    image: '/lovable-uploads/a6514654-403c-4313-a1ba-72241116b3e6.png',
  },
];

const casinoGames = [
  {
    id: '16',
    title: 'Royal Poker',
    image: '/lovable-uploads/a6514654-403c-4313-a1ba-72241116b3e6.png',
    multiplier: '5000',
  },
  {
    id: '17',
    title: 'Blackjack Pro',
    image: '/lovable-uploads/a6514654-403c-4313-a1ba-72241116b3e6.png',
  },
  {
    id: '18',
    title: 'Roulette Master',
    image: '/lovable-uploads/a6514654-403c-4313-a1ba-72241116b3e6.png',
    isNew: true,
  },
];

// Define all game categories for filtering
const gameCategories: Record<string, any[]> = {
  featuredGames,
  popularGames,
  slots: slotGames,
  liveGames,
  tableGames: casinoGames,
  sports: [],  // Empty array for now but can be populated later
  fishing: [],
  arcade: []
};

const Index = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [imagesPreloaded, setImagesPreloaded] = useState(false);
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };
  
  // Preload images for better performance
  useEffect(() => {
    const imagesToPreload = [
      ...featuredGames.map(game => game.image),
      ...popularGames.map(game => game.image),
      ...slotGames.map(game => game.image),
      ...liveGames.map(game => game.image),
      ...casinoGames.map(game => game.image)
    ];
    
    const uniqueImages = [...new Set(imagesToPreload)].filter(Boolean);
    let loadedCount = 0;
    
    uniqueImages.forEach(src => {
      if (!src) return;
      
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === uniqueImages.length) {
          setImagesPreloaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        console.error(`Failed to preload: ${src}`);
        if (loadedCount === uniqueImages.length) {
          setImagesPreloaded(true);
        }
      };
      img.src = src;
    });
    
    // Set preloaded to true after a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (!imagesPreloaded) {
        setImagesPreloaded(true);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);
  
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
