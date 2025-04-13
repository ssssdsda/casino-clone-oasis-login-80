
import React from 'react';
import { Bell, LogOut, User, Wallet, Headphones } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { LoginDialog } from './LoginDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  return (
    <header className="w-full bg-casino py-3 px-4 flex items-center justify-between border-b border-gray-800">
      <div className="flex items-center">
        <Link to="/" className="text-casino-accent text-2xl md:text-3xl font-bold tracking-wider animate-pulse-gold">
          CK444
        </Link>
      </div>
      
      <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-3'}`}>
        {isAuthenticated ? (
          <>
            <div className={`flex items-center ${isMobile ? 'flex-col space-y-1' : 'flex-row space-x-2'}`}>
              <Button variant="outline" className="bg-green-800 hover:bg-green-700 border-green-600 text-white text-xs md:text-sm px-2 md:px-4">
                <Wallet className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                Deposit
              </Button>
              <Button variant="outline" className="bg-red-800 hover:bg-red-700 border-red-600 text-white text-xs md:text-sm px-2 md:px-4">
                <Wallet className="mr-1 h-3 w-3 md:h-4 md:w-4" />
                Withdraw
              </Button>
            </div>
            <div className="bg-casino-dark rounded-full px-2 md:px-4 py-1 md:py-2 flex items-center">
              <User className="h-3 w-3 md:h-4 md:w-4 text-casino-accent mr-1 md:mr-2" />
              <span className="text-xs md:text-sm font-medium mr-1 md:mr-2">{user?.username}</span>
              <span className="text-casino-accent text-xs md:text-sm font-bold">${user?.balance}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 md:h-5 md:w-5 text-gray-300" />
            </Button>
          </>
        ) : (
          <LoginDialog />
        )}
      </div>
    </header>
  );
};

export default Header;
