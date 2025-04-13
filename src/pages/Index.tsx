
import React from 'react';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import Banner from '@/components/Banner';
import GameSection from '@/components/GameSection';
import Footer from '@/components/Footer';
import { WelcomePopup } from '@/components/WelcomePopup';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/LanguageContext';

// Game data
const popularGames = [
  {
    id: '1',
    title: 'Super Ace',
    image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=300&h=400',
    multiplier: '2000',
  },
  {
    id: '2',
    title: 'Money Coming',
    image: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=300&h=400',
  },
  {
    id: '3',
    title: 'Fortune Gems',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=300&h=400',
    isNew: true,
  },
  {
    id: '4',
    title: 'Wild Showdown',
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=300&h=400',
  },
  // More games for better grid
  {
    id: '5',
    title: 'Tiger Rush',
    image: 'https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?auto=format&fit=crop&w=300&h=400',
    multiplier: '3000',
  },
  {
    id: '6',
    title: 'Dragon Power',
    image: 'https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?auto=format&fit=crop&w=300&h=400',
  },
];

const slotGames = [
  {
    id: '6',
    title: 'Mega Spin',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&h=400',
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
];

const liveGames = [
  {
    id: '11',
    title: 'Live Blackjack',
    image: 'https://images.unsplash.com/photo-1511193311914-0346f16efe90?auto=format&fit=crop&w=300&h=400',
    isNew: true,
  },
  {
    id: '12',
    title: 'Live Roulette',
    image: 'https://images.unsplash.com/photo-1606167668584-78701c57f90d?auto=format&fit=crop&w=300&h=400',
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

const Index = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <div className="flex flex-1">
        {!isMobile && <CategorySidebar />}
        <main className={`flex-1 p-2 md:p-4 overflow-y-auto ${isMobile ? 'pb-16' : ''}`}>
          <Banner />
          <div className="mt-4 md:mt-6 space-y-4 md:space-y-6">
            <GameSection title="popularGames" games={popularGames} />
            <GameSection title="slots" games={slotGames} />
            <GameSection title="liveGames" games={liveGames} />
            <GameSection title="tableGames" games={casinoGames} />
          </div>
        </main>
      </div>
      <Footer />
      <WelcomePopup />
    </div>
  );
};

export default Index;
