
import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";

const banners = [
  {
    id: 1,
    image: "/lovable-uploads/a1c08101-4964-4060-9c92-da874d8f1545.png",
    alt: "CK444 Bonus Promotion"
  },
  {
    id: 2,
    image: "/lovable-uploads/775928d2-6812-404d-9ebb-2e620311cef9.png",
    alt: "CK444 Golden Egg Promotion"
  },
  {
    id: 3,
    image: "/lovable-uploads/092a4562-a61a-488e-b918-abdb6f27bc24.png",
    alt: "CK444 Million Bonus Promotion"
  },
  {
    id: 4,
    image: "/lovable-uploads/75130282-ef0e-4d13-8a32-3048c60bc45f.png",
    alt: "CK444 New Year Promotion"
  }
];

const PromoBanner = () => {
  const [api, setApi] = React.useState<any>();
  const [current, setCurrent] = React.useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll effect
  useEffect(() => {
    if (!api) return;
    
    // Set current slide index when it changes
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    
    // Start auto-scroll
    intervalRef.current = setInterval(() => {
      api.scrollNext();
    }, 4000);
    
    return () => {
      api.off("select", onSelect);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [api]);

  return (
    <div className="relative w-full mb-4">
      <Carousel 
        setApi={setApi} 
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative h-40 md:h-64 w-full overflow-hidden rounded">
                <img 
                  src={banner.image} 
                  alt={banner.alt} 
                  className="w-full h-full object-cover object-center transition-all hover:scale-105 duration-500"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                current === index ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
        
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 border-0 text-white" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 border-0 text-white" />
      </Carousel>
    </div>
  );
};

export default PromoBanner;
