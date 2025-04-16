
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const Analytics = () => {
  let location = { pathname: window.location.pathname };

  try {
    // This will only work inside a Router context
    location = useLocation();
  } catch (error) {
    console.warn('Analytics: Not inside a Router context, using window.location');
  }

  useEffect(() => {
    // Track page views
    const trackPageView = () => {
      try {
        if (typeof window !== 'undefined') {
          console.log(`Page viewed: ${location.pathname}`);
          // Here you would typically add your analytics code, like:
          // window.gtag('config', 'GA-MEASUREMENT-ID', {
          //   page_path: location.pathname,
          // });
        }
      } catch (error) {
        console.error('Error in analytics tracking:', error);
      }
    };

    trackPageView();
  }, [location]);

  return null; // This component doesn't render anything
};
