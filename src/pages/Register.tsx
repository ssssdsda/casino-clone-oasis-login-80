
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RegisterButton } from '@/components/RegisterButton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  
  // Extract referral code from URL when page loads
  React.useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      // Store referral code in localStorage
      localStorage.setItem('referralCode', refCode);
      console.log(`Referral code stored: ${refCode}`);
    }
    
    // If user is already logged in, redirect to home page
    if (isAuthenticated) {
      navigate('/');
    }
  }, [location.search, isAuthenticated, navigate]);

  // Automatically trigger register dialog when the page loads
  React.useEffect(() => {
    // Find and click the register button after a short delay
    const timer = setTimeout(() => {
      const registerButtonElement = document.querySelector('[data-register-button="true"]');
      if (registerButtonElement) {
        (registerButtonElement as HTMLButtonElement).click();
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <div className={`flex-1 flex items-center justify-center p-4 ${isMobile ? 'pb-16' : ''}`}>
        <Card className="w-full max-w-md bg-casino border border-casino-accent">
          <CardHeader className="bg-gradient-to-r from-green-700 to-green-600">
            <CardTitle className="text-white">{t('register')}</CardTitle>
            <CardDescription className="text-gray-100">
              {t('createAccount')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-white">
                Click the button below to register and get your welcome bonus!
              </p>
              <RegisterButton data-register-button={true} />
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
