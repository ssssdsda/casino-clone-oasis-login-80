
import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { addCacheBusterToUrl } from '@/utils/cacheUtils';

// Fresh new banner system with completely new design
const freshBannerData = [
  {
    id: 1,
    title: "Welcome to CK444",
    subtitle: "The Ultimate Casino Experience",
    bgColor: "from-purple-900 via-purple-800 to-indigo-900",
    accentColor: "bg-yellow-500",
    icon: "🎰"
  },
  {
    id: 2,
    title: "Join Now & Get ৳100",
    subtitle: "Registration Bonus for New Players",
    bgColor: "from-green-900 via-green-800 to-emerald-900",
    accentColor: "bg-orange-500",
    icon: "💰"
  },
  {
    id: 3,
    title: "Play Aviator",
    subtitle: "Fly High and Win Big",
    bgColor: "from-blue-900 via-blue-800 to-cyan-900",
    accentColor: "bg-red-500",
    icon: "✈️"
  },
  {
    id: 4,
    title: "Plinko Game",
    subtitle: "Drop Ball and Win Prizes",
    bgColor: "from-red-900 via-red-800 to-pink-900",
    accentColor: "bg-green-500",
    icon: "🎯"
  },
  {
    id: 5,
    title: "Refer Friends",
    subtitle: "Earn ৳90 for Each Referral",
    bgColor: "from-orange-900 via-orange-800 to-yellow-900",
    accentColor: "bg-purple-500",
    icon: "👥"
  }
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
      setCurrentIndex((prevIndex) => (prevIndex + 1) % freshBannerData.length);
    }, 4000);

    return () => {
      resetTimeout();
    };
  }, [currentIndex]);

  return (
    <div className="w-full relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg shadow-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className={`absolute inset-0 bg-gradient-to-br ${freshBannerData[currentIndex].bgColor}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white animate-pulse"></div>
            <div className="absolute top-32 right-20 w-16 h-16 rounded-full bg-white animate-pulse delay-300"></div>
            <div className="absolute bottom-20 left-32 w-12 h-12 rounded-full bg-white animate-pulse delay-700"></div>
            <div className="absolute bottom-32 right-10 w-24 h-24 rounded-full bg-white animate-pulse delay-500"></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center text-white px-6">
              <motion.div 
                className={`${freshBannerData[currentIndex].accentColor} text-6xl mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                {freshBannerData[currentIndex].icon}
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-2 drop-shadow-lg"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                {freshBannerData[currentIndex].title}
              </motion.h1>
              
              <motion.p 
                className="text-lg md:text-xl opacity-90 drop-shadow-md"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                {freshBannerData[currentIndex].subtitle}
              </motion.p>
            </div>
          </div>

          {/* Decorative elements */}
          <motion.div
            className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Indicators */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
        {freshBannerData.map((_, index) => (
          <motion.button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300`}
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
    </div>
  );
};

export default Banner;
