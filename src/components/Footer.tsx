
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, FileText, Gift, Bell, Menu, Mail, MessageCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ReferralButton from './ReferralButton';

const Footer = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [showSupportOptions, setShowSupportOptions] = useState(false);
  
  const openWhatsApp = () => {
    window.open('https://wa.me/+855965603197', '_blank');
  };
  
  const openTelegram = () => {
    window.open('https://t.me/Miki12347', '_blank');
  };
  
  // Support chat button that floats in the bottom right corner
  const SupportChatButton = () => (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="relative">
        <button
          onClick={() => setShowSupportOptions(!showSupportOptions)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-all"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
        
        {showSupportOptions && (
          <div className="absolute bottom-14 right-0 bg-white rounded-lg shadow-xl p-3 w-40 flex flex-col space-y-2 border border-gray-200">
            <button
              onClick={openWhatsApp}
              className="flex items-center space-x-2 py-2 px-3 hover:bg-green-50 rounded-md text-green-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/>
                <path d="M9 10a.5.5 0 0 1 1 0c0 .97 1.08 1.73 2 1.73a.5.5 0 0 1 0 1c-1.48 0-3-1.14-3-2.73z"/>
                <path d="M12 16.5c2.28 0 4.5-1.37 4.5-4.74 0-2.48-1.38-4.5-4.5-4.5-2.3 0-4.5 1.38-4.5 4.5 0 3.4 2.24 4.74 4.5 4.74z"/>
              </svg>
              <span>WhatsApp</span>
            </button>
            <button
              onClick={openTelegram}
              className="flex items-center space-x-2 py-2 px-3 hover:bg-blue-50 rounded-md text-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m22 3-9 9"/>
                <path d="m13 12 9 9"/>
                <path d="M12 17v.01"/>
                <path d="M3 8l1 3 3 3L8 21l3-1 3-3 3 1"/>
              </svg>
              <span>Telegram</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
  
  if (!isMobile) {
    return (
      <>
        <SupportChatButton />
        <footer className="bg-casino p-4 text-center text-white text-sm">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-left">
                <h3 className="font-bold mb-2">Contact Us</h3>
                <div className="flex items-center space-x-2 mb-1">
                  <Mail className="h-4 w-4" />
                  <span>rabellty96@gmail.com</span>
                </div>
              </div>
              <div className="text-left">
                <h3 className="font-bold mb-2">Support</h3>
                <div className="flex space-x-4">
                  <button 
                    onClick={openWhatsApp}
                    className="flex items-center space-x-1 text-green-400 hover:text-green-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/>
                      <path d="M9 10a.5.5 0 0 1 1 0c0 .97 1.08 1.73 2 1.73a.5.5 0 0 1 0 1c-1.48 0-3-1.14-3-2.73z"/>
                      <path d="M12 16.5c2.28 0 4.5-1.37 4.5-4.74 0-2.48-1.38-4.5-4.5-4.5-2.3 0-4.5 1.38-4.5 4.5 0 3.4 2.24 4.74 4.5 4.74z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </button>
                  <button 
                    onClick={openTelegram}
                    className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 3-9 9"/>
                      <path d="m13 12 9 9"/>
                      <path d="M12 17v.01"/>
                      <path d="M3 8l1 3 3 3L8 21l3-1 3-3 3 1"/>
                    </svg>
                    <span>@Miki12347</span>
                  </button>
                </div>
              </div>
            </div>
            <p>&copy; 2025 CK444. All rights reserved.</p>
          </div>
        </footer>
      </>
    );
  }
  
  if (isMobile && !isHomePage) {
    return (
      <>
        <SupportChatButton />
        <footer className="bg-casino p-4 text-center text-white text-sm">
          <div className="container mx-auto">
            <div className="mb-2">
              <div className="flex items-center justify-center space-x-4 mb-2">
                <button 
                  onClick={openTelegram}
                  className="flex items-center space-x-1 text-blue-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 3-9 9"/>
                    <path d="m13 12 9 9"/>
                    <path d="M12 17v.01"/>
                    <path d="M3 8l1 3 3 3L8 21l3-1 3-3 3 1"/>
                  </svg>
                  <span>@Miki12347</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xs">rabellty96@gmail.com</p>
              <p className="text-xs mt-1">&copy; 2025 CK444</p>
            </div>
          </div>
        </footer>
      </>
    );
  }
  
  // Only show the bottom navigation on the homepage for mobile
  if (isHomePage) {
    return (
      <>
        <SupportChatButton />
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
            
            {/* Highlight the referral button - only on homepage */}
            {isHomePage && (
              <div className="scale-110 transform -translate-y-1">
                <ReferralButton />
              </div>
            )}
            
            <button 
              onClick={openWhatsApp}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-md text-gray-300"
            >
              <MessageCircle className="h-5 w-5 text-green-400" />
              <span className="text-xs">Support</span>
            </button>
            
            <button 
              onClick={() => navigate('/more')}
              className="flex flex-col items-center justify-center py-1 px-3 rounded-md text-gray-300"
            >
              <Menu className="h-5 w-5" />
              <span className="text-xs">More</span>
            </button>
          </div>
        </div>
      </>
    );
  }
  
  return <SupportChatButton />;
};

export default Footer;
