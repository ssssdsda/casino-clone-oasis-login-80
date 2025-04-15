
import React, { useState, useEffect } from 'react';
import { Bell, LogOut, User, Wallet, Headphones, Globe, Menu, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { LoginButton } from './LoginButton';
import { RegisterButton } from './RegisterButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  // Use ৳ symbol for currency display
  const currencySymbol = '৳';
  
  // Format balance to remove decimal part
  const formatBalance = (balance: number | undefined) => {
    if (balance === undefined) return '0';
    return Math.floor(balance).toString();
  };
  
  const formattedBalance = formatBalance(user?.balance);
  
  return (
    <header className="w-full bg-casino py-3 px-4 flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="text-casino-accent text-2xl md:text-3xl font-bold tracking-wider animate-pulse-gold">
            CK444
          </Link>
        </div>
        
        {isMobile ? (
          <div className="flex items-center space-x-2">
            {isHomePage && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Menu className="h-5 w-5 text-white" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-casino border-casino-accent">
                  <div className="flex flex-col space-y-4 pt-6">
                    <div className="flex flex-col space-y-2">
                      <Button variant={language === 'en' ? "secondary" : "ghost"} onClick={() => setLanguage('en')}>
                        EN - English
                      </Button>
                      <Button variant={language === 'bn' ? "secondary" : "ghost"} onClick={() => setLanguage('bn')}>
                        BN - বাংলা
                      </Button>
                    </div>
                    
                    <Button variant="ghost" className="flex items-center justify-start">
                      <Headphones className="h-4 w-4 mr-2 text-white" />
                      <span className="text-white">{t('customerSupport')}</span>
                    </Button>
                    
                    {isAuthenticated && isHomePage && (
                      <Button 
                        variant="outline" 
                        className="flex items-center justify-start bg-gradient-to-r from-purple-700 to-orange-600 border-purple-500 text-white"
                        onClick={() => navigate('/referral')}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        <span>{t('referral')}</span>
                      </Button>
                    )}
                    
                    {isAuthenticated ? (
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between px-2 py-1 bg-casino-dark rounded-lg">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-casino-accent mr-2" />
                            <span className="font-medium text-white">{user?.username}</span>
                          </div>
                          <span className="text-casino-accent font-bold">{currencySymbol}{formattedBalance}</span>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          className="flex items-center justify-start"
                          onClick={logout}
                        >
                          <LogOut className="h-4 w-4 mr-2 text-white" />
                          <span className="text-white">Logout</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        <LoginButton />
                        <RegisterButton />
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
            
            {isAuthenticated && (
              <div className="bg-casino-dark rounded-lg px-2 py-1 flex items-center">
                <span className="text-xs font-medium mr-1 text-white">{user?.username}</span>
                <span className="text-casino-accent text-xs font-bold">{currencySymbol}{formattedBalance}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {isHomePage && (
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Globe className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-0">
                    <div className="flex flex-col">
                      <Button 
                        variant={language === 'en' ? "secondary" : "ghost"} 
                        className="justify-start rounded-none"
                        onClick={() => setLanguage('en')}
                      >
                        EN - English
                      </Button>
                      <Button 
                        variant={language === 'bn' ? "secondary" : "ghost"} 
                        className="justify-start rounded-none"
                        onClick={() => setLanguage('bn')}
                      >
                        BN - বাংলা
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Headphones className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </Button>
              </>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isHomePage && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="bg-green-800 hover:bg-green-700 border-green-600 text-white text-xs px-2 py-1 h-auto"
                      onClick={() => navigate('/deposit')}
                    >
                      <Wallet className="mr-1 h-3 w-3" />
                      {t('deposit')}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="bg-red-800 hover:bg-red-700 border-red-600 text-white text-xs px-2 py-1 h-auto"
                      onClick={() => navigate('/withdrawal')}
                    >
                      <Wallet className="mr-1 h-3 w-3" />
                      {t('withdraw')}
                    </Button>
                  </div>
                )}
                <div className="bg-casino-dark rounded-full px-2 py-1 flex items-center">
                  <User className="h-3 w-3 text-casino-accent mr-1" />
                  <span className="text-xs font-medium mr-1 text-white">{user?.username}</span>
                  <span className="text-casino-accent text-xs font-bold">{currencySymbol}{formattedBalance}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 text-white" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LoginButton />
                <RegisterButton />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile deposit/withdraw/login buttons */}
      {isMobile && isHomePage && (
        <div className="flex justify-center space-x-2 mt-2">
          {isAuthenticated ? (
            <>
              <Button 
                variant="outline" 
                className="bg-green-800 hover:bg-green-700 border-green-600 text-white px-3 py-1 h-auto flex-1 text-xs"
                onClick={() => navigate('/deposit')}
              >
                <Wallet className="mr-1 h-4 w-4" />
                {t('deposit')}
              </Button>
              <Button 
                variant="outline" 
                className="bg-red-800 hover:bg-red-700 border-red-600 text-white px-3 py-1 h-auto flex-1 text-xs"
                onClick={() => navigate('/withdrawal')}
              >
                <Wallet className="mr-1 h-4 w-4" />
                {t('withdraw')}
              </Button>
            </>
          ) : (
            <>
              <LoginButton />
              <RegisterButton />
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
