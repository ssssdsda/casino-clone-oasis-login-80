import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PromoBanner from '@/components/PromoBanner';
import Footer from '@/components/Footer';
import GameCategories from '@/components/GameCategories';
import { WelcomePopup } from '@/components/WelcomePopup';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import GameSection from '@/components/GameSection';

const Index = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-casino-dark flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="mt-4 text-white">Loading games...</div>
      </div>
    );
  }

  const featuredGames = [
    {
      id: 'book-of-dead',
      title: 'Book of Dead',
      image: '/lovable-uploads/43827a0e-ee9e-4d09-bbe4-cca5b3d5ce4e.png',
      path: '/game/book-of-dead',
      isNew: true
    },
    {
      id: 'fruity-bonanza',
      title: 'Fruity Bonanza',
      image: '/lovable-uploads/fe393b9b-3777-4f24-ac1f-d680e17dc51e.png',
      path: '/game/fruity-bonanza',
      isNew: true
    },
    {
      id: 'super-elements',
      title: 'Super Elements',
      image: '/lovable-uploads/29b7d4f3-2eed-413b-97ea-570ab0b7a5a3.png',
      path: '/game/super-element',
      isNew: true
    },
    {
      id: 'megaspin',
      title: 'Mega Tilt Spin',
      image: '/lovable-uploads/e2cc07ef-b195-486d-8e39-25c084173a3f.png',
      path: '/game/megaspin'
    },
    {
      id: 'aviator',
      title: 'Aviator',
      image: '/lovable-uploads/8655a847-c441-4713-a94d-59b16894e9cf.png',
      path: '/game/aviator'
    },
    {
      id: 'boxing-king',
      title: 'Boxing King',
      image: '/lovable-uploads/825eedf3-7b21-488f-9f67-b765219d4b18.png',
      path: '/game/boxing-king'
    },
    {
      id: 'plinko',
      title: 'Plinko',
      image: '/lovable-uploads/9116085e-489a-4b8b-add0-f3e1930eb5ec.png',
      path: '/game/plinko'
    },
    {
      id: 'casinowin',
      title: 'Casino Win',
      image: '/lovable-uploads/d8f0c404-600a-4031-b9b2-c5f3c67ac79d.png',
      path: '/game/spin'
    },
    {
      id: 'moneygram',
      title: 'Money Gram',
      image: '/lovable-uploads/5c14f8b4-466d-4d26-b33a-a4c54aa29279.png',
      path: '/game/moneygram'
    },
    {
      id: 'coinup',
      title: 'Coin Up',
      image: '/lovable-uploads/254f4915-c83e-4caa-9291-4322984e94ef.png',
      path: '/game/coin-up'
    },
    {
      id: 'fortunegems',
      title: 'Fortune Gems',
      image: '/lovable-uploads/79304bde-4c37-41d8-a808-22ab451af8d7.png',
      path: '/game/fortune-gems'
    }
  ];
  
  const newGames = [
    {
      id: 'book-of-dead',
      title: 'Book of Dead',
      image: '/lovable-uploads/43827a0e-ee9e-4d09-bbe4-cca5b3d5ce4e.png',
      path: '/game/book-of-dead',
      isNew: true
    },
    {
      id: 'fruity-bonanza',
      title: 'Fruity Bonanza',
      image: '/lovable-uploads/fe393b9b-3777-4f24-ac1f-d680e17dc51e.png',
      path: '/game/fruity-bonanza',
      isNew: true
    },
    {
      id: 'super-elements',
      title: 'Super Elements',
      image: '/lovable-uploads/29b7d4f3-2eed-413b-97ea-570ab0b7a5a3.png',
      path: '/game/super-element',
      isNew: true
    },
    {
      id: 'goldenbasin',
      title: 'Golden Basin',
      image: '/lovable-uploads/69f38369-5885-4865-bc46-719ce5687af3.png',
      path: '/game/golden-basin',
      isNew: true
    },
    {
      id: 'livefootball',
      title: 'Live Football',
      image: '/lovable-uploads/1821444d-c30d-4e0b-ac9a-49bed437fdd0.png',
      path: '/game/live-football',
      isNew: true
    },
    {
      id: 'livecricket',
      title: 'Live Cricket',
      image: '/lovable-uploads/da105e2a-9946-4442-a054-5d8bb967dd6d.png',
      path: '/game/live-cricket',
      isNew: true
    },
    {
      id: 'superace',
      title: 'Super Ace',
      image: '/lovable-uploads/ff7d4b10-032b-41d7-9313-48fcf2c0710a.png',
      path: '/game/super-ace',
      isNew: true
    }
  ];
  
  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      
      <main className={`flex-1 p-1 md:p-4 overflow-y-auto ${isMobile ? 'pb-16' : ''}`}>
        <PromoBanner />
        
        <GameCategories onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />
        
        <GameSection title="Featured Games" games={featuredGames} />
        <GameSection title="New Games" games={newGames} />
      </main>
      
      <Footer />
      <WelcomePopup />
    </div>
  );
};

export default Index;
