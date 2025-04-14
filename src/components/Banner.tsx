
import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const banners = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=1200&h=300",
    title: "VIP EXCLUSIVE BONUS",
  }
];

const Banner = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

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
    </div>
  );
};

export default Banner;
