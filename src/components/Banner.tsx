
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
    <div className="w-full relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg">
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
        </motion.div>
      </AnimatePresence>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {bannerImages.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              index === currentIndex ? 'bg-white' : 'bg-white/40'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
