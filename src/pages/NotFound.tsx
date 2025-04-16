
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, RefreshCw } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Enhanced error logging
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Check if this might be a referral link with wrong format
    if (location.pathname.includes('ref') || location.pathname.includes('r/')) {
      console.log("This appears to be a malformed referral link");
    }
    
    // Try to extract a referral code anyway to save the referral
    const pathParts = location.pathname.split('/');
    let possibleRefCode = null;
    
    // Check various possible referral code positions
    for (let i = 0; i < pathParts.length; i++) {
      if (pathParts[i] === 'ref' || pathParts[i] === 'r') {
        if (i + 1 < pathParts.length) {
          possibleRefCode = pathParts[i + 1];
          break;
        }
      }
    }
    
    // If we found a possible referral code, save it
    if (possibleRefCode) {
      localStorage.setItem('referralCode', possibleRefCode);
      console.log(`Saved possible referral code from 404 page: ${possibleRefCode}`);
    }
  }, [location.pathname]);
  
  // Go back one page in history
  const handleBack = () => {
    navigate(-1);
  };
  
  // Go to homepage
  const handleHome = () => {
    navigate('/');
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
