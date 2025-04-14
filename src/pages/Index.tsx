
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
          <Banner />
          
          {/* Game Grid Section */}
          <section className="mt-6">
            <h2 className="text-xl md:text-2xl font-bold text-orange-500 mb-4">Featured Games</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Mega Spin Game Card */}
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
              
              {/* Aviator Game Card */}
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
              
              {/* Boxing King Game Card */}
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
              
              {/* Plinko Game Card */}
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
