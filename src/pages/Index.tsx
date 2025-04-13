
import React from 'react';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import Banner from '@/components/Banner';
import GameSection from '@/components/GameSection';

const popularGames = [
  {
    id: '1',
    title: 'Super Ace',
    image: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=300&h=400',
    multiplier: '2000x',
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
    multiplier: '2600x',
  },
  {
    id: '8',
    title: 'Golden Wheel',
    image: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?auto=format&fit=crop&w=300&h=400',
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
    multiplier: '5000x',
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
  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <div className="flex flex-1">
        <CategorySidebar />
        <main className="flex-1 p-4 overflow-y-auto">
          <Banner />
          <div className="mt-6 space-y-8">
            <GameSection title="Popular Games" games={popularGames} />
            <GameSection title="Slots" games={slotGames} />
            <GameSection title="Live Casino" games={liveGames} />
            <GameSection title="Table Games" games={casinoGames} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
