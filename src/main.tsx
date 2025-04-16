
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enhanced navigation handler with better error handling
const handleNavigation = () => {
  console.log("Navigation handler running on path:", window.location.pathname);
  
  try {
    // Extract referral code from various formats
    const extractReferralCode = () => {
      // Check URL path for referral formats: /referral/CODE, /ref/CODE, /r/CODE
      const path = window.location.pathname;
      const pathParts = path.split('/');
      
      // Format 1: Check for /referral/CODE, /ref/CODE, or /r/CODE
      const possibleRefFormats = ['referral', 'ref', 'r'];
      for (const format of possibleRefFormats) {
        const refIndex = pathParts.indexOf(format);
        if (refIndex !== -1 && refIndex < pathParts.length - 1) {
          const possibleCode = pathParts[refIndex + 1];
          if (possibleCode && possibleCode.length > 1 && possibleCode !== 'undefined') {
            console.log(`Found referral code in path (${format}): ${possibleCode}`);
            return possibleCode;
          }
        }
      }
      
      // Format 2: Check URL search params for ?ref=CODE
      const urlParams = new URLSearchParams(window.location.search);
      const refFromQuery = urlParams.get('ref');
      if (refFromQuery && refFromQuery !== 'undefined') {
        console.log(`Found referral code in query: ${refFromQuery}`);
        return refFromQuery;
      }
      
      // Format 3: Try to extract from partial paths using regex
      const refRegex = /\/(ref|r|referral)[\/=]?([a-zA-Z0-9_-]+)/i;
      const match = path.match(refRegex);
      if (match && match[2] && match[2] !== 'undefined') {
        console.log(`Found referral code using regex: ${match[2]}`);
        return match[2];
      }
      
      return null;
    };
    
    // Try to extract referral code
    const refCode = extractReferralCode();
    
    // If found, save to localStorage
    if (refCode) {
      localStorage.setItem('referralCode', refCode);
      console.log(`Saved referral code: ${refCode}`);
      
      // If we're on a referral path but not on the register page, redirect
      if (!window.location.pathname.includes('register') && 
          (window.location.pathname.includes('ref') || 
           window.location.pathname.includes('r/'))) {
        console.log("Redirecting to register page with referral code");
        window.history.replaceState({}, document.title, `/register?ref=${refCode}`);
      }
    }
    
    // If we have a 404 error in the URL (added by some servers), clean it
    if (window.location.href.includes('/404.html')) {
      const cleanPath = window.location.href.replace('/404.html', '');
      window.history.replaceState({}, document.title, cleanPath);
      console.log("Cleaned 404 path to:", cleanPath);
    }
    
  } catch (error) {
    console.error("Error in navigation handler:", error);
  }
};

// Register error event listener for handling routing errors
window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('route') || e.message.includes('chunk') || 
     e.message.includes('failed') || e.message.includes('not found'))) {
    console.error('Router error detected:', e.message);
    // Force a refresh to the current path after a slight delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
});

// Execute navigation handling on page load
handleNavigation();

// Render the application
createRoot(document.getElementById("root")!).render(<App />);
