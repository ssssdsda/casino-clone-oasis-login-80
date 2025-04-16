
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add event listener for routing-related errors
window.addEventListener('error', (e) => {
  // Check if it's a routing error
  if (e.message && (e.message.includes('route') || e.message.includes('chunk'))) {
    console.error('Routing error detected:', e.message);
    // Force a refresh to the current path
    window.location.reload();
  }
});

// Handle navigation errors with proper fallbacks
const handleNavigation = () => {
  // If we have a 404 error in the URL (added by some servers), clean it
  if (window.location.href.includes('/404.html')) {
    const cleanPath = window.location.href.replace('/404.html', '');
    window.history.replaceState({}, document.title, cleanPath);
  }
};

// Execute navigation handling
handleNavigation();

// Render the application
createRoot(document.getElementById("root")!).render(<App />);
