
import React from 'react';
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

const ReferralButton = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const handleReferralClick = () => {
    navigate('/referral');
  };
  
  return (
    <Button 
      onClick={handleReferralClick}
      variant="outline"
      className="bg-gradient-to-r from-green-600 to-green-700 border-green-500 text-white font-semibold flex gap-2 items-center justify-center animate-pulse-slow"
    >
      <Users className="h-4 w-4" />
      {t('referral')}
    </Button>
  );
};

export default ReferralButton;
