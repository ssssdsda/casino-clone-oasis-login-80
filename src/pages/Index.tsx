
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CategorySidebar from '@/components/CategorySidebar';
import Banner from '@/components/Banner';
import PromoBanner from '@/components/PromoBanner';
import Footer from '@/components/Footer';
import { WelcomePopup } from '@/components/WelcomePopup';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/LanguageContext';

// We're removing all the game data and game sections as requested

const Index = () => {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
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
  
  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <PromoBanner />
      <div className="flex flex-1">
        {!isMobile && <CategorySidebar onCategorySelect={handleCategorySelect} selectedCategory={selectedCategory} />}
        <main className={`flex-1 p-1 md:p-4 overflow-y-auto ${isMobile ? 'pb-16' : ''}`}>
          <Banner />
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
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

