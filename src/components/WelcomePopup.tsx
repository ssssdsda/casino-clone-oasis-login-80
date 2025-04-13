
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  
  useEffect(() => {
    // Only show welcome popup when a user first logs in
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (isAuthenticated && !hasSeenWelcome) {
      setOpen(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [isAuthenticated]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-[#0e363d] to-[#0a2328] border-casino-accent">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">{t('welcome')}</DialogTitle>
          <DialogDescription className="text-gray-300">
            We're thrilled to have you join our casino community!
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg">
          <img 
            src="https://images.unsplash.com/photo-1542297566-39ea5e9dafa5?auto=format&fit=crop&w=500&h=300"
            alt="Welcome" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a2328] to-transparent flex items-end p-4">
            <p className="text-white text-xl font-bold">
              Hello, {user?.username}!
            </p>
          </div>
        </div>
        
        <p className="text-gray-300 mb-4">
          Enjoy our selection of exciting games and try your luck! Your initial balance is <span className="text-casino-accent font-bold">{t('currency')}{user?.balance}</span>.
        </p>
        
        <DialogFooter>
          <Button 
            onClick={() => setOpen(false)} 
            className="w-full bg-casino-accent hover:bg-casino-accent-hover text-black font-bold"
          >
            {t('startPlaying')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
