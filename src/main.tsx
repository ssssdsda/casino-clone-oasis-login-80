
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Enhanced navigation handler for better error recovery and referral tracking
const handleNavigation = () => {
  console.log("Navigation handler running on path:", window.location.pathname);
  
  // If we have a 404 error in the URL (added by some servers), clean it
  if (window.location.href.includes('/404.html')) {
    const cleanPath = window.location.href.replace('/404.html', '');
    window.history.replaceState({}, document.title, cleanPath);
    console.log("Cleaned 404 path to:", cleanPath);
  }
  
  // Extract and store referral code from URL path if present
  const pathParts = window.location.pathname.split('/');
  const possibleRefFormats = ['referral', 'ref', 'r'];
  
  // Check for referral code in the path segments
  for (const format of possibleRefFormats) {
    const refIndex = pathParts.indexOf(format);
    if (refIndex !== -1 && refIndex < pathParts.length - 1) {
      const refCode = pathParts[refIndex + 1];
      if (refCode && refCode.length > 1) {
        localStorage.setItem('referralCode', refCode);
        console.log(`Navigation handler stored referral code (${format}): ${refCode}`);
        break;
      }
    }
  }
  
  // Also check URL search params for ref=
  const urlParams = new URLSearchParams(window.location.search);
  const refFromQuery = urlParams.get('ref');
  if (refFromQuery) {
    localStorage.setItem('referralCode', refFromQuery);
    console.log(`Navigation handler stored referral code (query): ${refFromQuery}`);
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
