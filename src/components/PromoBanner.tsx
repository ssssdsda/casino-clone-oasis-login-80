
import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const banners = [
  {
    id: 1,
    image: "/lovable-uploads/a023c13d-3432-4f56-abd9-5bcdbbd30602.png",
    alt: "CK444 Bonus Promotion"
  },
  {
    id: 2,
    image: "/lovable-uploads/7e03f44f-1482-4424-8f8c-40ab158dba36.png",
    alt: "CK444 Golden Egg Promotion"
  },
  {
    id: 3,
    image: "/lovable-uploads/6fc263a6-a7b2-4cf2-afe5-9fb0b99fdd91.png",
    alt: "CK444 Million Taka Prize"
  },
  {
    id: 4,
    image: "/lovable-uploads/d10fd039-e61a-4e50-8145-a1efe284ada2.png",
    alt: "CK444 New Year Bonus"
  }
];

const PromoBanner = () => {
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
    <div className="relative w-full mb-4">
      <div 
        ref={scrollRef} 
        className="banner-slider flex w-full overflow-x-hidden scroll-smooth snap-x snap-mandatory"
      >
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            className="min-w-full h-40 md:h-64 relative flex-shrink-0 snap-center"
          >
            <img 
              src={banner.image} 
              alt={banner.alt} 
              className="w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <Button 
        variant="outline" 
        size="icon" 
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 border-none hover:bg-black hover:bg-opacity-70 rounded-full h-8 w-8"
        onClick={() => handleScroll('left')}
        disabled={currentSlide === 0}
      >
        <ChevronLeft className="h-4 w-4 text-white" />
      </Button>

      <Button 
        variant="outline" 
        size="icon" 
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 border-none hover:bg-black hover:bg-opacity-70 rounded-full h-8 w-8"
        onClick={() => handleScroll('right')}
        disabled={currentSlide === banners.length - 1}
      >
        <ChevronRight className="h-4 w-4 text-white" />
      </Button>

      {/* Indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 ${currentSlide === index ? 'w-4 bg-casino-accent' : 'w-1.5 bg-gray-300'} rounded-full transition-all`}
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

export default PromoBanner;
