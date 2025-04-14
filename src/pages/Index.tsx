
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import Banner from '@/components/Banner';
import PromoBanner from '@/components/PromoBanner';
import Footer from '@/components/Footer';
import { WelcomePopup } from '@/components/WelcomePopup';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

  const handleMegaSpinClick = () => {
    navigate('/game/megaspin');
  };
  
  const handleAviatorClick = () => {
    navigate('/game/aviator');
  };
  
  const handleBoxingKingClick = () => {
    navigate('/game/boxing-king');
  };
  
  const handlePlinkoClick = () => {
    navigate('/game/plinko');
  };
  
  const handleCasinoWinClick = () => {
    navigate('/game/spin');
  };
  
  const handleMoneyGramClick = () => {
    navigate('/game/moneygram');
  };
  
  const handleCoinUpClick = () => {
    navigate('/game/coin-up');
  };
  
  const handleFortuneGemsClick = () => {
    navigate('/game/fortune-gems');
  };
  
  const handleGoldenBasinClick = () => {
    navigate('/game/golden-basin');
  };
  
  const handleLiveFootballClick = () => {
    navigate('/game/live-football');
  };
  
  const handleLiveCricketClick = () => {
    navigate('/game/live-cricket');
  };
  
  const handleSuperAceClick = () => {
    navigate('/game/super-ace');
  };
  
  const handleCoinsGameClick = () => {
    navigate('/game/777coins');
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
      id: 'megaspin',
      title: 'Mega Tilt Spin',
      image: '/lovable-uploads/e2cc07ef-b195-486d-8e39-25c084173a3f.png',
      multiplier: 'Win up to 1000x your bet',
      path: '/game/megaspin',
      onClick: handleMegaSpinClick
    },
    {
      id: 'aviator',
      title: 'Aviator',
      image: '/lovable-uploads/8655a847-c441-4713-a94d-59b16894e9cf.png',
      multiplier: 'Fly high with big wins',
      path: '/game/aviator',
      onClick: handleAviatorClick
    },
    {
      id: 'boxing-king',
      title: 'Boxing King',
      image: '/lovable-uploads/825eedf3-7b21-488f-9f67-b765219d4b18.png',
      multiplier: 'Fight for the championship',
      path: '/game/boxing-king',
      onClick: handleBoxingKingClick
    },
    {
      id: 'plinko',
      title: 'Plinko',
      image: '/lovable-uploads/9116085e-489a-4b8b-add0-f3e1930eb5ec.png',
      multiplier: 'Drop the ball for big prizes',
      path: '/game/plinko',
      onClick: handlePlinkoClick
    }
  ];

  const moreGames = [
    {
      id: 'casinowin',
      title: 'Casino Win',
      image: '/lovable-uploads/d8f0c404-600a-4031-b9b2-c5f3c67ac79d.png',
      multiplier: 'Spin and Win Big!',
      path: '/game/spin',
      onClick: handleCasinoWinClick
    },
    {
      id: 'moneygram',
      title: 'Money Gram',
      image: '/lovable-uploads/5c14f8b4-466d-4d26-b33a-a4c54aa29279.png',
      multiplier: 'Cash is Coming!',
      path: '/game/moneygram',
      onClick: handleMoneyGramClick
    },
    {
      id: 'coinup',
      title: 'Coin Up',
      image: '/lovable-uploads/254f4915-c83e-4caa-9291-4322984e94ef.png',
      multiplier: 'Hot Fire 3x3!',
      path: '/game/coin-up',
      onClick: handleCoinUpClick
    },
    {
      id: 'fortunegems',
      title: 'Fortune Gems',
      image: '/lovable-uploads/79304bde-4c37-41d8-a808-22ab451af8d7.png',
      multiplier: 'Golden Treasures!',
      path: '/game/fortune-gems',
      onClick: handleFortuneGemsClick
    }
  ];
  
  // New game cards being added
  const extraGames = [
    {
      id: 'goldenbasin',
      title: 'Golden Basin',
      image: '/lovable-uploads/69f38369-5885-4865-bc46-719ce5687af3.png',
      multiplier: 'Roll in gold!',
      path: '/game/golden-basin',
      onClick: handleGoldenBasinClick,
      isNew: true
    },
    {
      id: 'livefootball',
      title: 'Live Football',
      image: '/lovable-uploads/1821444d-c30d-4e0b-ac9a-49bed437fdd0.png',
      multiplier: 'Real-time football action!',
      path: '/game/live-football',
      onClick: handleLiveFootballClick,
      isNew: true
    },
    {
      id: 'livecricket',
      title: 'Live Cricket',
      image: '/lovable-uploads/da105e2a-9946-4442-a054-5d8bb967dd6d.png',
      multiplier: 'Cricket betting live!',
      path: '/game/live-cricket',
      onClick: handleLiveCricketClick,
      isNew: true
    },
    {
      id: 'superace',
      title: 'Super Ace',
      image: '/lovable-uploads/ff7d4b10-032b-41d7-9313-48fcf2c0710a.png',
      multiplier: 'Be the Ace!',
      path: '/game/super-ace',
      onClick: handleSuperAceClick,
      isNew: true
    },
    {
      id: '777coins',
      title: '777 Coins',
      image: '/lovable-uploads/a1de6d81-6374-4dbf-b6ca-8305cc8bf5b4.png',
      multiplier: 'Triple 7s jackpot!',
      path: '/game/777coins',
      onClick: handleCoinsGameClick,
      isNew: true
    }
  ];
  
  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <PromoBanner />
      <div className="flex flex-1">
        {!isMobile && <CategorySidebar onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />}
        <main className={`flex-1 p-1 md:p-4 overflow-y-auto ${isMobile ? 'pb-16' : ''}`}>
          <Banner />
          
          <section className="mt-6">
            <h2 className="text-xl md:text-2xl font-bold text-orange-500 mb-4">Featured Games</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-purple-900 to-indigo-900 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMegaSpinClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/e2cc07ef-b195-486d-8e39-25c084173a3f.png" 
                    alt="Mega Tilt Spin" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Mega Tilt Spin</h3>
                    <p className="text-yellow-400 text-sm">Win up to 1000x your bet</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full text-white font-bold hover:from-orange-600 hover:to-orange-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-red-900 to-blue-900 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAviatorClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/8655a847-c441-4713-a94d-59b16894e9cf.png" 
                    alt="Aviator" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Aviator</h3>
                    <p className="text-yellow-400 text-sm">Fly high with big wins</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-white font-bold hover:from-red-600 hover:to-red-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-yellow-800 to-red-900 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBoxingKingClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/825eedf3-7b21-488f-9f67-b765219d4b18.png" 
                    alt="Boxing King" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Boxing King</h3>
                    <p className="text-yellow-400 text-sm">Fight for the championship</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full text-white font-bold hover:from-yellow-600 hover:to-yellow-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-purple-700 to-pink-800 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlinkoClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/9116085e-489a-4b8b-add0-f3e1930eb5ec.png" 
                    alt="Plinko" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Plinko</h3>
                    <p className="text-yellow-400 text-sm">Drop the ball for big prizes</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-bold hover:from-pink-600 hover:to-purple-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
          
          <section className="mt-6">
            <h2 className="text-xl md:text-2xl font-bold text-orange-500 mb-4">More Exciting Games</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-purple-700 to-pink-800 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCasinoWinClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/d8f0c404-600a-4031-b9b2-c5f3c67ac79d.png" 
                    alt="Casino Win" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Casino Win</h3>
                    <p className="text-yellow-400 text-sm">Spin and Win Big!</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white font-bold hover:from-pink-600 hover:to-purple-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-green-700 to-green-900 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMoneyGramClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/5c14f8b4-466d-4d26-b33a-a4c54aa29279.png" 
                    alt="Money Gram" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Money Gram</h3>
                    <p className="text-yellow-400 text-sm">Cash is Coming!</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full text-white font-bold hover:from-green-600 hover:to-green-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-orange-600 to-red-800 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCoinUpClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/254f4915-c83e-4caa-9291-4322984e94ef.png" 
                    alt="Coin Up" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Coin Up</h3>
                    <p className="text-yellow-400 text-sm">Hot Fire 3x3!</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-white font-bold hover:from-orange-600 hover:to-red-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-yellow-600 to-orange-800 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFortuneGemsClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/79304bde-4c37-41d8-a808-22ab451af8d7.png" 
                    alt="Fortune Gems" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Fortune Gems</h3>
                    <p className="text-yellow-400 text-sm">Golden Treasures!</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full text-white font-bold hover:from-yellow-600 hover:to-orange-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
          
          {/* New section for the additional games */}
          <section className="mt-6">
            <h2 className="text-xl md:text-2xl font-bold text-orange-500 mb-4">New Game Releases</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Golden Basin Game Card */}
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-yellow-700 to-amber-900 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoldenBasinClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/69f38369-5885-4865-bc46-719ce5687af3.png" 
                    alt="Golden Basin" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute top-1 left-1 bg-orange-500 text-[8px] md:text-xs font-bold text-black px-1 py-0.5 rounded z-10">
                    NEW
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Golden Basin</h3>
                    <p className="text-yellow-400 text-sm">Roll in gold!</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full text-white font-bold hover:from-amber-600 hover:to-amber-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Live Football Game Card */}
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-blue-700 to-blue-900 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLiveFootballClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/1821444d-c30d-4e0b-ac9a-49bed437fdd0.png" 
                    alt="Live Football" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute top-1 left-1 bg-orange-500 text-[8px] md:text-xs font-bold text-black px-1 py-0.5 rounded z-10">
                    NEW
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Live Football</h3>
                    <p className="text-yellow-400 text-sm">Real-time football action!</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white font-bold hover:from-blue-600 hover:to-blue-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Live Cricket Game Card */}
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-yellow-600 to-red-700 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLiveCricketClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/da105e2a-9946-4442-a054-5d8bb967dd6d.png" 
                    alt="Live Cricket" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute top-1 left-1 bg-orange-500 text-[8px] md:text-xs font-bold text-black px-1 py-0.5 rounded z-10">
                    NEW
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Live Cricket</h3>
                    <p className="text-yellow-400 text-sm">Cricket betting live!</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-white font-bold hover:from-red-600 hover:to-red-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Super Ace Game Card */}
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-green-600 to-green-900 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSuperAceClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/ff7d4b10-032b-41d7-9313-48fcf2c0710a.png" 
                    alt="Super Ace" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute top-1 left-1 bg-orange-500 text-[8px] md:text-xs font-bold text-black px-1 py-0.5 rounded z-10">
                    NEW
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">Super Ace</h3>
                    <p className="text-yellow-400 text-sm">Be the Ace!</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full text-white font-bold hover:from-green-600 hover:to-green-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* 777 Coins Game Card */}
              <motion.div 
                className="relative rounded-lg overflow-hidden bg-gradient-to-b from-red-600 to-amber-700 shadow-xl"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCoinsGameClick}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src="/lovable-uploads/a1de6d81-6374-4dbf-b6ca-8305cc8bf5b4.png" 
                    alt="777 Coins" 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  
                  <div className="absolute top-1 left-1 bg-orange-500 text-[8px] md:text-xs font-bold text-black px-1 py-0.5 rounded z-10">
                    NEW
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">777 Coins</h3>
                    <p className="text-yellow-400 text-sm">Triple 7s jackpot!</p>
                    
                    <button 
                      className="mt-3 px-4 py-2 bg-gradient-to-r from-amber-500 to-red-600 rounded-full text-white font-bold hover:from-amber-600 hover:to-red-700 transition-colors"
                    >
                      Play Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
          
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center mt-8">
            <h2 className="text-2xl md:text-3xl font-bold text-orange-500 mb-4">Welcome to Our Casino</h2>
            <p className="text-gray-300 max-w-2xl">
              We're updating our games. Please check back soon for an enhanced gaming experience!
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-orange-400 mb-3">Deposit</h3>
                <p className="text-gray-400 mb-4">Add funds to your account to start playing our exciting games.</p>
              </div>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-orange-400 mb-3">Bonus</h3>
                <p className="text-gray-400 mb-4">Check out our latest promotions and bonuses.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
      <WelcomePopup />
    </div>
  );
};

export default Index;
