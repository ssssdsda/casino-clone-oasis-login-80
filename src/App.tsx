
import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from './components/ui/toast';
import { ExtendedToaster } from './hooks/use-extended-toast';
import "./App.css";

function App() {
  // Handle history popstate for SPA
  useEffect(() => {
    const handlePopState = () => {
      console.log('Navigation: popstate event detected');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
            <Toaster />
            <ExtendedToaster />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
