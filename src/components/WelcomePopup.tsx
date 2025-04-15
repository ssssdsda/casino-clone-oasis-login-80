
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
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [popupSettings, setPopupSettings] = useState({
    title: 'Big Offer!',
    description: "Deposit now and get 100% bonus!",
    imageUrl: '/lovable-uploads/5035849b-d0e0-4890-af49-cc92532ea221.png',
    messageText: 'Deposit now and get 100% bonus. Low turnover requirements and you can withdraw amounts as low as ৳200!',
    buttonText: 'Get Bonus Now',
  });
  
  useEffect(() => {
    // Load popup settings from Firebase
    const loadPopupSettings = async () => {
      try {
        const db = getFirestore();
        const settingsRef = doc(db, "settings", "welcomePopup");
        const settingsSnap = await getDoc(settingsRef);
        
        if (settingsSnap.exists()) {
          const data = settingsSnap.data() as any;
          // Override messageText with our required message
          data.messageText = 'Deposit now and get 100% bonus. Low turnover requirements and you can withdraw amounts as low as ৳200!';
          setPopupSettings(data);
        }
      } catch (error) {
        console.error("Error loading popup settings:", error);
      }
    };
    
    loadPopupSettings();
  }, []);
  
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
          <DialogTitle className="text-white text-2xl">{popupSettings.title}</DialogTitle>
          <DialogDescription className="text-gray-300">
            {popupSettings.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg">
          <img 
            src={popupSettings.imageUrl}
            alt="Big Offer" 
            className="w-full h-full object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a2328] to-transparent flex items-end p-4">
            <p className="text-white text-xl font-bold">
              Hello, {user?.username}!
            </p>
          </div>
        </div>
        
        <p className="text-gray-300 mb-4">
          {popupSettings.messageText} <span className="text-casino-accent font-bold">৳{user?.balance.toFixed(0)}</span>.
        </p>
        
        <DialogFooter>
          <Button 
            onClick={() => setOpen(false)} 
            className="w-full bg-casino-accent hover:bg-casino-accent-hover text-black font-bold"
          >
            {popupSettings.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
