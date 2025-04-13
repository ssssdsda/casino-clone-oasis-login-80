
import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const banners = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=1200&h=300",
    title: "VIP EXCLUSIVE BONUS",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&h=300",
    title: "DAILY REWARDS",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&h=300",
    title: "NEW GAMES",
  },
];

const Banner = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
      
      // Update current slide based on scroll position
      const newIndex = direction === 'left' 
        ? Math.max(currentSlide - 1, 0) 
        : Math.min(currentSlide + 1, banners.length - 1);
      
      setCurrentSlide(newIndex);
    }
  };

  useEffect(() => {
    // Auto scroll every 5 seconds
    const interval = setInterval(() => {
      if (currentSlide >= banners.length - 1) {
        setCurrentSlide(0);
        scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        handleScroll('right');
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div className="relative w-full">
      <div 
        ref={scrollRef} 
        className="banner-slider flex w-full overflow-x-hidden scroll-smooth snap-x snap-mandatory"
      >
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            className="min-w-full h-64 relative flex-shrink-0 snap-center"
          >
            <img 
              src={banner.image} 
              alt={banner.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <h2 className="text-4xl font-bold text-casino-accent text-center">
                {banner.title}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 border-none hover:bg-black hover:bg-opacity-70 rounded-full"
        onClick={() => handleScroll('left')}
        disabled={currentSlide === 0}
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </Button>

      <Button 
        variant="outline" 
        size="icon" 
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 border-none hover:bg-black hover:bg-opacity-70 rounded-full"
        onClick={() => handleScroll('right')}
        disabled={currentSlide === banners.length - 1}
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`h-2 ${currentSlide === index ? 'w-6 bg-casino-accent' : 'w-2 bg-gray-300'} rounded-full transition-all`}
            onClick={() => {
              setCurrentSlide(index);
              scrollRef.current?.scrollTo({
                left: index * scrollRef.current.clientWidth,
                behavior: 'smooth',
              });
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Banner;
