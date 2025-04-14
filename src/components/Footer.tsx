
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, FileText, Gift, Bell, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ReferralButton from './ReferralButton';

const Footer = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!isMobile) {
    return (
      <footer className="bg-casino p-4 text-center text-white text-sm">
        <div className="container mx-auto">
          <p>&copy; 2025 CK444. All rights reserved.</p>
        </div>
      </footer>
    );
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-casino border-t border-casino-accent z-50">
      <div className="flex justify-between items-center p-2">
        <button 
          onClick={() => navigate('/')}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-3 rounded-md",
            location.pathname === '/' ? "text-casino-accent" : "text-gray-300"
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </button>
        
        <button 
          onClick={() => navigate('/bonus')}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-3 rounded-md",
            location.pathname === '/bonus' ? "text-casino-accent" : "text-gray-300"
          )}
        >
          <Gift className="h-5 w-5" />
          <span className="text-xs">Bonus</span>
        </button>
        
        {/* Replace one of the existing buttons with the referral button */}
        <div className="scale-110">
          <ReferralButton />
        </div>
        
        <button 
          className="flex flex-col items-center justify-center py-1 px-3 rounded-md text-gray-300"
        >
          <Bell className="h-5 w-5" />
          <span className="text-xs">Notify</span>
        </button>
        
        <button 
          className="flex flex-col items-center justify-center py-1 px-3 rounded-md text-gray-300"
        >
          <Menu className="h-5 w-5" />
          <span className="text-xs">More</span>
        </button>
      </div>
    </div>
  );
};

export default Footer;
