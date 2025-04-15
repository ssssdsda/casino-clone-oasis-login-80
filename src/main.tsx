
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Improved handling of routing-related errors
window.addEventListener('error', (e) => {
  // Check if it's a routing error or chunk loading error
  if (e.message && (e.message.includes('route') || e.message.includes('chunk'))) {
    console.error('Routing error detected:', e.message);
    // Force a refresh to the current path after a slight delay
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
});

// Enhanced navigation handler for better error recovery
const handleNavigation = () => {
  // If we have a 404 error in the URL (added by some servers), clean it
  if (window.location.href.includes('/404.html')) {
    const cleanPath = window.location.href.replace('/404.html', '');
    window.history.replaceState({}, document.title, cleanPath);
  }
  
  // Handle referral paths and direct to registration page
  const pathParts = window.location.pathname.split('/');
  if (pathParts.includes('ref') || pathParts.includes('r')) {
    const refIndex = pathParts.includes('ref') ? 
      pathParts.indexOf('ref') : pathParts.indexOf('r');
    
    if (refIndex !== -1 && refIndex < pathParts.length - 1) {
      const refCode = pathParts[refIndex + 1];
      if (refCode) {
        // Store referral code in localStorage for later use
        localStorage.setItem('referralCode', refCode);
        console.log(`Navigation handler stored referral code: ${refCode}`);
      }
    }
  }
};

// Execute navigation handling on page load
handleNavigation();

// Render the application
createRoot(document.getElementById("root")!).render(<App />);
