
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PromoBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageConfigs, setImageConfigs] = useState<{[key: string]: string}>({});

  const defaultBanners = [
    {
      id: 1,
      title: "Welcome Bonus",
      subtitle: "Get 100% bonus on your first deposit!",
      image: "/lovable-uploads/a023c13d-3432-4f56-abd9-5bcdbbd30602.png",
      cta: "Claim Now"
    },
    {
      id: 2,
      title: "Daily Rewards",
      subtitle: "Login daily to get amazing rewards",
      image: "/lovable-uploads/7e03f44f-1482-4424-8f8c-40ab158dba36.png",
      cta: "Play Now"
    },
    {
      id: 3,
      title: "VIP Program",
      subtitle: "Join our exclusive VIP program",
      image: "/lovable-uploads/6fc263a6-a7b2-4cf2-afe5-9fb0b99fdd91.png",
      cta: "Learn More"
    },
    {
      id: 4,
      title: "Weekly Tournament", 
      subtitle: "Compete with other players for big prizes",
      image: "/lovable-uploads/d10fd039-e61a-4e50-8145-a1efe284ada2.png",
      cta: "Join Now"
    }
  ];

  // Load image configurations from database
  useEffect(() => {
    fetchImageConfigs();
  }, []);

  const fetchImageConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('image_configs')
        .select('*')
        .eq('image_type', 'banner');

      if (error) {
        console.error('Error fetching banner configs:', error);
        return;
      }

      const configs: {[key: string]: string} = {};
      data?.forEach(config => {
        configs[config.image_key] = config.image_url;
      });
      setImageConfigs(configs);
    } catch (error) {
      console.error('Error in fetchImageConfigs:', error);
    }
  };

  const getImageSrc = (bannerId: number, defaultSrc: string) => {
    const key = `banner_${bannerId}`;
    return imageConfigs[key] || defaultSrc;
  };

  const banners = defaultBanners.map(banner => ({
    ...banner,
    image: getImageSrc(banner.id, banner.image)
  }));

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-48 md:h-64 lg:h-80 mb-6 rounded-lg overflow-hidden group">
      {/* Banner Images */}
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
              <div className="p-6 md:p-8 lg:p-12 text-white max-w-md">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">
                  {banner.title}
                </h2>
                <p className="text-sm md:text-base lg:text-lg mb-4 opacity-90">
                  {banner.subtitle}
                </p>
                <button className="bg-casino-accent text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
                  {banner.cta}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? 'bg-casino-accent' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PromoBanner;
