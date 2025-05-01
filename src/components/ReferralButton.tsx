
import React from 'react';
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext'; 
import { generateUniqueReferralCode } from '@/lib/firebase';

const ReferralButton = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  
  const handleReferralClick = async () => {
    try {
      // If the user is logged in, ensure they have a referral code generated
      if (user && user.id && !user.referralCode) {
        try {
          await generateUniqueReferralCode(user.id);
          console.log("Generated referral code for user");
        } catch (error) {
          console.error("Failed to generate referral code:", error);
        }
      }
      
      // Navigate to referral page
      navigate('/referral');
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };
  
  return (
    <Button 
      onClick={handleReferralClick}
      variant="outline"
      className="bg-gradient-to-r from-green-600 to-green-700 border-green-500 text-white font-semibold flex gap-2 items-center justify-center animate-pulse-slow"
    >
      <Users className="h-4 w-4" />
      {t('referral') || 'Refer & Earn'}
    </Button>
  );
};

export default ReferralButton;
