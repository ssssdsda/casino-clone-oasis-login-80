
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const bannerImages = [
  '/lovable-uploads/d63bf1f6-ac8d-40d6-a419-67c3915f5333.png',
  '/lovable-uploads/20b5cda9-f61f-4024-bbb6-1cfee6353614.png',
  '/lovable-uploads/dec17aad-46e5-47a3-a4b1-7f0b72c530f0.png', 
  '/lovable-uploads/672f03a3-2462-487d-a60a-df1660da9fb7.png'
];

const Banner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 4000);

    return () => {
      resetTimeout();
    };
  }, [currentIndex]);

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
        <motion.div 
          className="bg-yellow-500/90 text-black px-3 py-1 rounded-md inline-block font-bold mb-2"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          NEW USERS
        </motion.div>
        <h2 className="text-white text-2xl font-bold mb-1 drop-shadow-lg">Get ৳89 Bonus</h2>
        <p className="text-white/90 text-sm drop-shadow-md">Sign up today and verify your email</p>
      </motion.div>
    </div>
  );
};

export default Banner;
