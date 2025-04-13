
import React from 'react';
import { Bell, LogOut, User, Wallet } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { LoginDialog } from './LoginDialog';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="w-full bg-casino py-3 px-4 flex items-center justify-between border-b border-gray-800">
      <div className="flex items-center">
        <a href="/" className="text-casino-accent text-3xl font-bold tracking-wider animate-pulse-gold">
          CK444
        </a>
      </div>
      
      <div className="flex items-center space-x-3">
        {isAuthenticated ? (
          <>
            <div className="hidden md:flex items-center space-x-3">
              <Button variant="outline" className="bg-green-800 hover:bg-green-700 border-green-600 text-white">
                <Wallet className="mr-2 h-4 w-4" />
                Deposit
              </Button>
              <Button variant="outline" className="bg-red-800 hover:bg-red-700 border-red-600 text-white">
                <Wallet className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
            </div>
            <div className="bg-casino-dark rounded-full px-4 py-2 flex items-center">
              <User className="h-4 w-4 text-casino-accent mr-2" />
              <span className="text-sm font-medium mr-2">{user?.username}</span>
              <span className="text-casino-accent font-bold">${user?.balance}</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={logout}
            >
              <LogOut className="h-5 w-5 text-gray-300" />
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
