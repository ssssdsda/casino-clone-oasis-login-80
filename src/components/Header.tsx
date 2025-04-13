
import React from 'react';
import { Bell, LogOut, User, Wallet, Headphones, Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { LoginButton } from './LoginButton';
import { RegisterButton } from './RegisterButton';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const isMobile = useIsMobile();

  return (
    <header className="w-full bg-casino py-3 px-4 flex items-center justify-between border-b border-gray-800">
      <div className="flex items-center">
        <Link to="/" className="text-casino-accent text-2xl md:text-3xl font-bold tracking-wider animate-pulse-gold">
          CK444
        </Link>
      </div>
      
      <div className="flex items-center space-x-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Globe className="h-4 w-4 md:h-5 md:w-5 text-gray-300" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-0">
            <div className="flex flex-col">
              <Button 
                variant={language === 'en' ? "secondary" : "ghost"} 
                className="justify-start rounded-none"
                onClick={() => setLanguage('en')}
              >
                English
              </Button>
              <Button 
                variant={language === 'bn' ? "secondary" : "ghost"} 
                className="justify-start rounded-none"
                onClick={() => setLanguage('bn')}
              >
                বাংলা
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Headphones className="h-4 w-4 md:h-5 md:w-5 text-gray-300" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-casino border border-casino-accent">
            <div className="space-y-4">
              <h4 className="font-medium text-white">{t('customerSupport')}</h4>
              <div className="flex items-center space-x-2">
                <Button className="w-full bg-casino-accent hover:bg-casino-accent-hover text-black font-bold">
                  {t('customerSupport')}
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <div className={isMobile ? "flex flex-col gap-1" : "flex gap-2"}>
              <Button variant="outline" className="bg-green-800 hover:bg-green-700 border-green-600 text-white text-xs px-2 py-1 h-auto">
                <Wallet className="mr-1 h-3 w-3" />
                {t('deposit')}
              </Button>
              <Button variant="outline" className="bg-red-800 hover:bg-red-700 border-red-600 text-white text-xs px-2 py-1 h-auto">
                <Wallet className="mr-1 h-3 w-3" />
                {t('withdraw')}
              </Button>
            </div>
            <div className="bg-casino-dark rounded-full px-2 py-1 flex items-center">
              <User className="h-3 w-3 text-casino-accent mr-1" />
              <span className="text-xs font-medium mr-1">{user?.username}</span>
              <span className="text-casino-accent text-xs font-bold">{t('currency')}{user?.balance}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 text-gray-300" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <LoginButton />
            <RegisterButton />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
