
// Utility functions to handle cache clearing and image refreshing

export const clearImageCache = async (): Promise<void> => {
  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('Cleared all browser caches');
    }
    
    // Force reload all images on the page
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src) {
        const url = new URL(img.src, window.location.origin);
        url.searchParams.set('cache_bust', Date.now().toString());
        img.src = url.toString();
      }
    });
    
    console.log('Force refreshed all images');
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
};

export const addCacheBusterToUrl = (url: string): string => {
  try {
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set('v', Date.now().toString());
    return urlObj.toString();
  } catch (error) {
    console.error('Error adding cache buster to URL:', error);
    return url + '?v=' + Date.now();
  }
};

export const refreshPageImages = (): void => {
  // Force refresh all background images
  const elementsWithBg = document.querySelectorAll('[style*="background-image"]');
  elementsWithBg.forEach(element => {
    const style = (element as HTMLElement).style;
    const bgImage = style.backgroundImage;
    if (bgImage && bgImage.includes('url(')) {
      const urlMatch = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        const newUrl = addCacheBusterToUrl(urlMatch[1]);
        style.backgroundImage = `url("${newUrl}")`;
      }
    }
  });
  
  console.log('Refreshed background images');
};

export const clearLocalStorageCache = (prefix?: string): void => {
  try {
    if (prefix) {
      // Clear specific cache entries
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      });
      console.log(`Cleared localStorage entries with prefix: ${prefix}`);
    } else {
      // Clear all localStorage (use with caution)
      localStorage.clear();
      console.log('Cleared all localStorage');
    }
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};
