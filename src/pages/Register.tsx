
import React from 'react';
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
  
  // Extract referral code from URL and path parameters when page loads
  React.useEffect(() => {
    const handleReferralCode = async () => {
      // Check for referral code in query parameters
      const urlParams = new URLSearchParams(location.search);
      let refCode = urlParams.get('ref');
      
      // If not in query params, check if it's in the path (for /ref/CODE format)
      if (!refCode && location.pathname.includes('/ref/')) {
        const pathParts = location.pathname.split('/');
        const refIndex = pathParts.indexOf('ref');
        if (refIndex !== -1 && refIndex < pathParts.length - 1) {
          refCode = pathParts[refIndex + 1];
        }
      }
      
      if (refCode) {
        // Store referral code in localStorage
        localStorage.setItem('referralCode', refCode);
        console.log(`Referral code stored: ${refCode}`);
        
        // Also track this referral view in Firebase for analytics
        try {
          const referralViewId = `view_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          await setDoc(doc(db, "referralViews", referralViewId), {
            referralCode: refCode,
            timestamp: new Date(),
            userAgent: navigator.userAgent,
            viewedOn: window.location.href
          });
        } catch (error) {
          console.error("Error tracking referral view:", error);
        }
      }
      
      // If user is already logged in, redirect to home page
      if (isAuthenticated) {
        navigate('/');
      }
    };
    
    handleReferralCode();
  }, [location.search, location.pathname, isAuthenticated, navigate, db]);

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
