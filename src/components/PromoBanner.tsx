
import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

const banners = [
  {
    id: 1,
    image: "/lovable-uploads/a023c13d-3432-4f56-abd9-5bcdbbd30602.png",
    alt: "CK444 Bonus Promotion"
  }
];

const PromoBanner = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

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
    </div>
  );
};

export default PromoBanner;
