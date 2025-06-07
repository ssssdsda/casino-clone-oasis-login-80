
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, User, Settings, LogOut, Coins, Gift, CreditCard, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleAuthClick = () => {
    navigate('/auth');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-casino border-b border-casino-accent shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-casino-accent cursor-pointer" onClick={() => navigate('/')}>
              🎰 BigWin
            </div>
          </div>

          {/* Balance and Navigation - Desktop */}
          {!isMobile && (
            <div className="flex items-center space-x-4">
              {isAuthenticated && user && (
                <div className="flex items-center bg-casino-dark px-4 py-2 rounded-lg border border-casino-accent">
                  <Coins className="h-4 w-4 text-casino-accent mr-2" />
                  <span className="text-white font-medium">PKR {user.balance.toFixed(0)}</span>
                </div>
              )}
              
              <nav className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-casino-accent hover:text-black">
                        <User className="h-4 w-4" />
                        <span>{user?.username}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-casino border-casino-accent">
                      <DropdownMenuItem onClick={() => navigate('/deposit')} className="text-white hover:bg-casino-accent hover:text-black">
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Deposit</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/withdrawal')} className="text-white hover:bg-casino-accent hover:text-black">
                        <Wallet className="mr-2 h-4 w-4" />
                        <span>Withdrawal</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/bonus')} className="text-white hover:bg-casino-accent hover:text-black">
                        <Gift className="mr-2 h-4 w-4" />
                        <span>Bonus</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/referral')} className="text-white hover:bg-casino-accent hover:text-black">
                        <User className="mr-2 h-4 w-4" />
                        <span>Referral</span>
                      </DropdownMenuItem>
                      {user?.role === 'admin' && (
                        <>
                          <DropdownMenuSeparator className="bg-casino-accent" />
                          <DropdownMenuItem onClick={() => navigate('/admin')} className="text-white hover:bg-casino-accent hover:text-black">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Admin Panel</span>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator className="bg-casino-accent" />
                      <DropdownMenuItem onClick={handleLogout} className="text-white hover:bg-casino-accent hover:text-black">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    onClick={handleAuthClick}
                    className="bg-casino-accent text-black hover:bg-yellow-400 font-semibold"
                  >
                    Login
                  </Button>
                )}
              </nav>
            </div>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              {isAuthenticated && user && (
                <div className="flex items-center bg-casino-dark px-2 py-1 rounded border border-casino-accent">
                  <Coins className="h-3 w-3 text-casino-accent mr-1" />
                  <span className="text-white text-sm font-medium">PKR {user.balance.toFixed(0)}</span>
                </div>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-casino-accent p-2"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobile && mobileMenuOpen && (
          <div className="border-t border-casino-accent bg-casino-dark">
            <nav className="py-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2 text-casino-accent font-semibold">
                    Welcome, {user?.username}
                  </div>
                  <button
                    onClick={() => {
                      navigate('/deposit');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-casino-accent hover:text-black flex items-center"
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    Deposit
                  </button>
                  <button
                    onClick={() => {
                      navigate('/withdrawal');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-casino-accent hover:text-black flex items-center"
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Withdrawal
                  </button>
                  <button
                    onClick={() => {
                      navigate('/bonus');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-casino-accent hover:text-black flex items-center"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Bonus
                  </button>
                  <button
                    onClick={() => {
                      navigate('/referral');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-casino-accent hover:text-black flex items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Referral
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        navigate('/admin');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-white hover:bg-casino-accent hover:text-black flex items-center"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-casino-accent hover:text-black flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    handleAuthClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-casino-accent hover:bg-casino-accent hover:text-black"
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
