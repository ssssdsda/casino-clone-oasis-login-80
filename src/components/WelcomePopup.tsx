
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
  const [popupSettings, setPopupSettings] = useState({
    enabled: true,
    title: 'Big Offer!',
    description: "Deposit now and get 100% bonus!",
    messageText: 'Deposit now and get 100% bonus. Low turnover requirements and you can withdraw amounts as low as PKR 200!',
    buttonText: 'Get Bonus Now',
    showOnLogin: true,
    backgroundGradient: 'from-red-900 to-red-700',
    borderColor: 'border-red-500'
  });
  
  useEffect(() => {
    // Load popup settings from localStorage as fallback
    const loadPopupSettings = async () => {
      try {
        const savedSettings = localStorage.getItem('bonus_popup_settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setPopupSettings(prevSettings => ({
            ...prevSettings,
            ...parsedSettings
          }));
        }
      } catch (error) {
        console.error("Error loading popup settings from localStorage:", error);
      }
    };
    
    loadPopupSettings();
  }, []);
  
  useEffect(() => {
    // Only show welcome popup when enabled and user first logs in
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (isAuthenticated && !hasSeenWelcome && popupSettings.enabled && popupSettings.showOnLogin) {
      setOpen(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [isAuthenticated, popupSettings.enabled, popupSettings.showOnLogin]);

  if (!popupSettings.enabled) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className={`sm:max-w-[500px] bg-gradient-to-br ${popupSettings.backgroundGradient} ${popupSettings.borderColor}`}>
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">{popupSettings.title}</DialogTitle>
          <DialogDescription className="text-red-100">
            {popupSettings.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="text-center py-6">
          <p className="text-white text-xl font-bold mb-4">
            Hello, {user?.username}!
          </p>
          <p className="text-red-100 mb-4">
            {popupSettings.messageText} <span className="text-yellow-300 font-bold">PKR {user?.balance?.toFixed(0)}</span>.
          </p>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => setOpen(false)} 
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold"
          >
            {popupSettings.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
