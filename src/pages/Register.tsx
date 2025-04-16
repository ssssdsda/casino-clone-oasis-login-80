
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RegisterButton } from '@/components/RegisterButton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const { isAuthenticated } = useAuth();
  const db = getFirestore();
  
  // Enhanced referral code extraction that handles all possible URL formats
  useEffect(() => {
    const handleReferralCode = async () => {
      let refCode = null;
      
      // Method 1: Check URL query parameters
      const urlParams = new URLSearchParams(location.search);
      refCode = urlParams.get('ref');
      
      // Method 2: Check path for /ref/CODE format
      if (!refCode) {
        const pathParts = location.pathname.split('/');
        const refIndex = pathParts.indexOf('ref');
        if (refIndex !== -1 && refIndex < pathParts.length - 1) {
          refCode = pathParts[refIndex + 1];
        }
      }
      
      // Method 3: Check path for /r/CODE format (short version)
      if (!refCode) {
        const pathParts = location.pathname.split('/');
        const refIndex = pathParts.indexOf('r');
        if (refIndex !== -1 && refIndex < pathParts.length - 1) {
          refCode = pathParts[refIndex + 1];
        }
      }
      
      // If we found a referral code by any method, store it and log the event
      if (refCode) {
        console.log(`Found referral code: ${refCode} via ${location.pathname}`);
        localStorage.setItem('referralCode', refCode);
        
        try {
          // Track this referral view in Firebase with additional debugging info
          const referralViewId = `view_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          await setDoc(doc(db, "referralViews", referralViewId), {
            referralCode: refCode,
            timestamp: new Date(),
            userAgent: navigator.userAgent,
            viewedPath: location.pathname,
            viewedUrl: window.location.href,
            queryParams: location.search
          });
          console.log(`Referral view tracked in Firebase: ${referralViewId}`);
        } catch (error) {
          console.error("Error tracking referral view:", error);
        }
      } else {
        console.log("No referral code found in URL");
      }
      
      // If user is already logged in, redirect to home page
      if (isAuthenticated) {
        navigate('/');
      }
    };
    
    handleReferralCode();
  }, [location.search, location.pathname, isAuthenticated, navigate, db]);

  // Automatically trigger register dialog when the page loads
  useEffect(() => {
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
