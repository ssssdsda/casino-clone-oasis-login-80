
// Enhanced cache clearing utilities with aggressive image refresh

export const clearAllCaches = async (): Promise<void> => {
  try {
    console.log('Starting aggressive cache clearing...');
    
    // Clear all browser caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('Cleared all browser caches');
    }
    
    // Clear localStorage image cache
    Object.keys(localStorage).forEach(key => {
      if (key.includes('image') || key.includes('banner') || key.includes('cache')) {
        localStorage.removeItem(key);
      }
    });
    
    // Force refresh all images with aggressive cache busting
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (img.src) {
        const url = new URL(img.src, window.location.origin);
        url.searchParams.set('nocache', Date.now().toString());
        url.searchParams.set('refresh', Math.random().toString());
        img.src = url.toString();
      }
    });
    
    // Force refresh background images
    const elementsWithBg = document.querySelectorAll('[style*="background-image"]');
    elementsWithBg.forEach(element => {
      const style = (element as HTMLElement).style;
      const bgImage = style.backgroundImage;
      if (bgImage && bgImage.includes('url(')) {
        const urlMatch = bgImage.match(/url\(['"]?([^'")]+)['"]?\)/);
        if (urlMatch && urlMatch[1]) {
          const url = new URL(urlMatch[1], window.location.origin);
          url.searchParams.set('nocache', Date.now().toString());
          url.searchParams.set('refresh', Math.random().toString());
          style.backgroundImage = `url("${url.toString()}")`;
        }
      }
    });
    
    console.log('Aggressive cache clearing completed');
  } catch (error) {
    console.error('Error in aggressive cache clearing:', error);
  }
};

export const addCacheBusterToUrl = (url: string): string => {
  try {
    const urlObj = new URL(url, window.location.origin);
    urlObj.searchParams.set('nocache', Date.now().toString());
    urlObj.searchParams.set('refresh', Math.random().toString());
    return urlObj.toString();
  } catch (error) {
    console.error('Error adding cache buster to URL:', error);
    return url + '?nocache=' + Date.now() + '&refresh=' + Math.random();
  }
};
