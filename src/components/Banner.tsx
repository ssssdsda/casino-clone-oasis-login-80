
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { addCacheBusterToUrl } from '@/utils/cacheUtils';

const baseBannerImages = [
  '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', // Fruity Bonanza image
  '/lovable-uploads/9116085e-489a-4b8b-add0-f3e1930eb5ec.png', // Plinko game image
  '/lovable-uploads/d63bf1f6-ac8d-40d6-a419-67c3915f5333.png',
  '/lovable-uploads/20b5cda9-f61f-4024-bbb6-1cfee6353614.png',
  '/lovable-uploads/dec17aad-46e5-47a3-a4b1-7f0b72c530f0.png', 
  '/lovable-uploads/672f03a3-2462-487d-a60a-df1660da9fb7.png'
];

const Banner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Apply cache busting to all banner images on component mount
  useEffect(() => {
    const cacheBustedImages = baseBannerImages.map(img => addCacheBusterToUrl(img));
    setBannerImages(cacheBustedImages);
    console.log('Banner images loaded with cache busting:', cacheBustedImages);
  }, []);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    if (bannerImages.length === 0) return;
    
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 4000);

    return () => {
      resetTimeout();
    };
  }, [currentIndex, bannerImages.length]);

  if (bannerImages.length === 0) {
    return <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-800 rounded-lg animate-pulse"></div>;
  }

  return (
    <div className="w-full relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg shadow-lg">
      {/* Animated light effects */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <motion.div 
          className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-yellow-500/20 to-transparent"
          initial={{ x: -300, opacity: 0 }}
          animate={{ 
            x: 300, 
            opacity: [0, 1, 0],
            transition: { 
              repeat: Infinity, 
              duration: 3, 
              repeatType: "loop",
              ease: "easeInOut"
            } 
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, x: 200 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -200 }}
          transition={{ duration: 0.7 }}
        >
          <img
            src={bannerImages[currentIndex]}
            alt={`Banner ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Banner image failed to load, retrying with new cache buster');
              e.currentTarget.src = addCacheBusterToUrl(baseBannerImages[currentIndex]);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </motion.div>
      </AnimatePresence>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {bannerImages.map((_, index) => (
          <motion.button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors duration-300`}
            initial={false}
            animate={{ 
              backgroundColor: index === currentIndex ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
              scale: index === currentIndex ? 1.2 : 1
            }}
            onClick={() => setCurrentIndex(index)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
      
      {/* Promotional text */}
      <motion.div
        className="absolute left-6 bottom-10 z-20 max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {currentIndex === 0 ? (
          <>
            <motion.div 
              className="bg-yellow-500/90 text-black px-3 py-1 rounded-md inline-block font-bold mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              NEW GAME
            </motion.div>
            <h2 className="text-white text-2xl font-bold mb-1 drop-shadow-lg">FRUITY BONANZA</h2>
            <p className="text-white/90 text-sm drop-shadow-md">Win big with juicy fruits and jackpots!</p>
          </>
        ) : currentIndex === 1 ? (
          <>
            <motion.div 
              className="bg-purple-500/90 text-white px-3 py-1 rounded-md inline-block font-bold mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              UPDATED
            </motion.div>
            <h2 className="text-white text-2xl font-bold mb-1 drop-shadow-lg">PLINKO</h2>
            <p className="text-white/90 text-sm drop-shadow-md">Enhanced graphics and bigger rewards!</p>
          </>
        ) : currentIndex === 2 ? (
          <>
            <motion.div 
              className="bg-yellow-500/90 text-black px-3 py-1 rounded-md inline-block font-bold mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              NEW USERS
            </motion.div>
            <h2 className="text-white text-2xl font-bold mb-1 drop-shadow-lg">Get ৳82 Bonus</h2>
            <p className="text-white/90 text-sm drop-shadow-md">Register and verify your phone number</p>
          </>
        ) : currentIndex === 3 ? (
          <>
            <motion.div 
              className="bg-green-500/90 text-black px-3 py-1 rounded-md inline-block font-bold mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              SPECIAL OFFER
            </motion.div>
            <h2 className="text-white text-2xl font-bold mb-1 drop-shadow-lg">Deposit ৳500</h2>
            <p className="text-white/90 text-sm drop-shadow-md">Get ৳500 free bonus instantly!</p>
          </>
        ) : (
          <>
            <motion.div 
              className="bg-blue-500/90 text-white px-3 py-1 rounded-md inline-block font-bold mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              FEATURED
            </motion.div>
            <h2 className="text-white text-2xl font-bold mb-1 drop-shadow-lg">{currentIndex === 4 ? "Aviator Game" : "Cricket Betting"}</h2>
            <p className="text-white/90 text-sm drop-shadow-md">Play now and win big rewards!</p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Banner;
