
import React from 'react';
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

const ReferralButton = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Enhanced referral link generation with improved error handling
  const handleClick = () => {
    try {
      if (user) {
        // For logged-in users, navigate to referral program page
        console.log("User clicked referral button, navigating to referral page");
        
        // Use React Router navigation
        navigate('/referral', { replace: false });
      } else {
        // For non-logged in users, direct to registration page
        console.log("Non-logged in user clicked referral button, redirecting to register");
        navigate('/register', { replace: false });
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
