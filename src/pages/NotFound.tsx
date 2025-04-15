import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, RefreshCw } from "lucide-react";
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const db = getFirestore();
  
  // Enhanced 404 handling with referral code recovery
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Track 404 errors in Firebase
    const track404Error = async () => {
      try {
        const errorId = `error_404_${Date.now()}`;
        await setDoc(doc(db, "errors", errorId), {
          path: location.pathname,
          fullUrl: window.location.href,
          timestamp: new Date(),
          userAgent: navigator.userAgent
        });
        console.log("404 error tracked in Firebase");
      } catch (err) {
        console.error("Error tracking 404:", err);
      }
    };
    
    track404Error();
    
    // Try to extract a referral code from the path
    const attemptReferralCodeExtraction = async () => {
      const path = location.pathname;
      let possibleRefCode = null;
      
      // Check if path contains referral-related keywords
      const refKeywords = ['ref', 'referral', 'r'];
      let isReferralPath = false;
      
      for (const keyword of refKeywords) {
        if (path.includes(keyword)) {
          isReferralPath = true;
          console.log("This appears to be a malformed referral link with keyword:", keyword);
          break;
        }
      }
      
      if (isReferralPath) {
        // Method 1: Split by slashes and look for code after ref keyword
        const pathParts = path.split('/');
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i].toLowerCase();
          if (refKeywords.includes(part) && i + 1 < pathParts.length) {
            possibleRefCode = pathParts[i + 1];
            if (possibleRefCode && possibleRefCode !== 'undefined') {
              console.log(`Found possible referral code after ${part}: ${possibleRefCode}`);
              break;
            }
          }
        }
        
        // Method 2: Try to find code using regex pattern matching
        if (!possibleRefCode) {
          const refRegex = /\/(?:ref|r|referral)[\/=]?([a-zA-Z0-9_-]+)/i;
          const match = path.match(refRegex);
          if (match && match[1] && match[1] !== 'undefined') {
            possibleRefCode = match[1];
            console.log("Found possible referral code using regex:", possibleRefCode);
          }
        }
        
        // If we found a possible referral code, save it
        if (possibleRefCode && possibleRefCode !== 'undefined') {
          localStorage.setItem('referralCode', possibleRefCode);
          console.log(`Saved possible referral code from 404 page: ${possibleRefCode}`);
          
          // Track this recovery in Firebase for analytics
          try {
            const recoveryId = `recovery_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            await setDoc(doc(db, "referralRecovery", recoveryId), {
              originalPath: path,
              recoveredCode: possibleRefCode,
              timestamp: new Date(),
              userAgent: navigator.userAgent
            });
            console.log("Referral code recovery tracked in Firebase");
          } catch (err) {
            console.error("Error tracking referral recovery:", err);
          }
          
          // Automatic redirection to register page with the recovered code
          setTimeout(() => {
            navigate(`/register?ref=${possibleRefCode}`);
          }, 300);
        }
      }
    };
    
    attemptReferralCodeExtraction();
  }, [location.pathname, navigate, db]);
  
  // Go back one page in history
  const handleBack = () => {
    navigate(-1);
  };
  
  // Go to homepage
  const handleHome = () => {
    navigate('/', {replace: true});
  };
  
  // Retry the current URL (useful for temporary server issues)
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-casino-dark">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-lg bg-casino-dark border border-casino-accent rounded-lg p-8 shadow-lg">
          <div className="relative w-48 h-48 mx-auto mb-6">
            <img 
              src="/lovable-uploads/e9c7da13-24c6-4c70-995e-71163cddfb35.png"
              alt="404 Error"
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-white">404</h1>
          <p className="text-xl text-gray-300 mb-4">Oops! Page not found</p>
          <p className="text-gray-400 mb-8">
            This is not a fault, just an accident that was not intentional.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={handleBack}
              variant="outline" 
              className="flex items-center gap-2 border-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            
            <Button 
              onClick={handleHome}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Home className="h-4 w-4" />
              Return to Home
            </Button>
            
            <Button 
              onClick={handleRefresh}
              variant="secondary" 
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default NotFound;
