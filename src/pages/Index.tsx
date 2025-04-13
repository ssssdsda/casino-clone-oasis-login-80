
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
  {
    id: '5',
    title: 'Super Elements',
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=300&h=400',
    multiplier: '2000x',
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
  {
    id: '9',
    title: 'Red Dragon',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=300&h=400',
    multiplier: '2600x',
  },
  {
    id: '10',
    title: 'Retro Arcade',
    image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=300&h=400',
    isNew: true,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <div className="flex flex-1">
        <CategorySidebar />
        <main className="flex-1 p-4">
          <Banner />
          <div className="mt-6">
            <GameSection title="Popular Games" games={popularGames} />
            <GameSection title="Slots" games={slotGames} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
