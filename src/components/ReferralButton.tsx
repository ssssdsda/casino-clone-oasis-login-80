
import React from 'react';
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const ReferralButton = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Enhanced referral link generation with improved error handling
  const handleClick = async () => {
    try {
      if (user) {
        // For logged-in users, navigate to referral program page
        console.log("User clicked referral button, navigating to referral page");
        
        // Check if user has a referral code already
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          // User exists in firestore
          const userData = userSnap.data();
          
          // If no referral code exists, create one
          if (!userData.referralCode) {
            // Generate referral code (using user ID for simplicity)
            const referralCode = user.uid.substring(0, 8);
            
            // Save referral code to user document
            await setDoc(userRef, { 
              referralCode: referralCode 
            }, { merge: true });
            
            console.log("Created new referral code:", referralCode);
            
            toast({
              title: t('referralCodeCreated'),
              description: t('yourReferralCodeWasCreated'),
              duration: 5000, // Extended duration to 5 seconds
            });
          }
        }
        
        // Use React Router navigation
        navigate('/referral', { replace: false });
      } else {
        // For non-logged in users, direct to registration page
        console.log("Non-logged in user clicked referral button, redirecting to register");
        
        // Add URL parameter to indicate they came from referral button
        navigate('/register?from=referral', { replace: false });
        
        toast({
          title: t('loginRequired'),
          description: t('loginToAccessReferral'),
          duration: 5000, // Extended duration to 5 seconds
        });
      }
    } catch (error) {
      console.error("Navigation error:", error);
      
      // Fallback: direct browser navigation if React Router fails
      window.location.href = user ? '/referral' : '/register';
    }
  };
  
  return (
    <Button 
      onClick={handleClick}
      variant="outline"
      className="bg-gradient-to-r from-green-600 to-green-700 border-green-500 text-white font-semibold flex gap-2 items-center justify-center animate-pulse-slow"
    >
      <Users className="h-4 w-4" />
      {t('referral')}
    </Button>
  );
};

export default ReferralButton;
