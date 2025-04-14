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
    image: '/lovable-uploads/ba327bc8-d695-4ebf-a7f8-0d4ae1540fdc.png',
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
    image: '/lovable-uploads/76f6d207-e6db-4fd4-8872-4c3c8691bfae.png',
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
    id: '4',
    title: 'Wild Showdown',
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=300&h=400',
  },
  {
    id: '5',
    title: 'Tiger Rush',
    image: 'https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?auto=format&fit=crop&w=300&h=400',
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
    image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=300&h=400',
    multiplier: '3200',
    path: '/game/777coins'
  },
  {
    id: 'mega-spin-pop',
    title: 'Mega Spin',
    image: '/lovable-uploads/467a6111-4e8b-4892-9521-c87da94084c0.png',
    multiplier: '4000',
    path: '/game/megaspin'
  },
];

const slotGames = [
  {
    id: 'mega-spin-slot',
    title: 'Mega Spin',
    image: '/lovable-uploads/76f6d207-e6db-4fd4-8872-4c3c8691bfae.png',
    path: '/game/megaspin'
  },
  {
    id: '7',
    title: 'Lucky Heroes',
    image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=300&h=400',
    multiplier: '2600',
  },
  {
    id: '8',
    title: 'Golden Wheel',
    image: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=300&h=400',
  },
  {
    id: '9',
    title: 'Diamond Rush',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&h=400',
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
    image: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=300&h=400',
    multiplier: '3200',
    path: '/game/777coins'
  },
];

const liveGames = [
  {
    id: '11',
    title: 'Live Cricket',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=300&h=400',
    isNew: true,
    path: '/game/live-cricket'
  },
  {
    id: '12',
    title: 'Live Football',
    image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=300&h=400',
    isNew: true,
    path: '/game/live-football'
  },
  {
    id: '13',
    title: 'Live Baccarat',
    image: 'https://images.unsplash.com/photo-1494797262163-102fae527c62?auto=format&fit=crop&w=300&h=400',
  },
];

const casinoGames = [
  {
    id: '16',
    title: 'Royal Poker',
    image: 'https://images.unsplash.com/photo-1528812969535-4999fa0d1cf3?auto=format&fit=crop&w=300&h=400',
    multiplier: '5000',
  },
  {
    id: '17',
    title: 'Blackjack Pro',
    image: 'https://images.unsplash.com/photo-1606167668584-78701c57f90d?auto=format&fit=crop&w=300&h=400',
  },
  {
    id: '18',
    title: 'Roulette Master',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=300&h=400',
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
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };
  
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
