import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

/**
 * Hook to handle deep links in the app
 * Supports both custom scheme (athletica://) and universal links (https://athleticasports.app)
 */
export const useDeepLink = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Only run on native platforms (iOS/Android)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    // Handle app URL open events (custom scheme and universal links)
    const handleAppUrl = async (event: { url: string }) => {
      try {
        console.log('[DeepLink] App opened with URL:', event.url);
        
        let path = '';
        let searchParams = '';
        
        // Handle custom scheme (athletica://) and universal links (https://)
        if (event.url.startsWith('athletica://')) {
          // Custom scheme: athletica://events/123?param=value
          const urlWithoutScheme = event.url.replace('athletica://', '');
          const [pathPart, queryPart] = urlWithoutScheme.split('?');
          path = pathPart || '';
          searchParams = queryPart ? `?${queryPart}` : '';
        } else {
          // Universal link: https://athleticasports.app/events/123?param=value
          try {
            const url = new URL(event.url);
            path = url.pathname;
            searchParams = url.search;
          } catch (e) {
            // Fallback: try to extract path manually
            const match = event.url.match(/https?:\/\/[^\/]+(\/.*)/);
            if (match) {
              const fullPath = match[1];
              const [pathPart, queryPart] = fullPath.split('?');
              path = pathPart || '';
              searchParams = queryPart ? `?${queryPart}` : '';
            }
          }
        }
        
        // Ensure path starts with /
        if (path && !path.startsWith('/')) {
          path = `/${path}`;
        }
        
        // If no path, default to home
        const fullPath = path || '/';
        const finalPath = searchParams ? `${fullPath}${searchParams}` : fullPath;
        
        console.log('[DeepLink] Navigating to:', finalPath);
        
        // Navigate to the path
        navigate(finalPath);
      } catch (error) {
        console.error('[DeepLink] Error handling URL:', error);
      }
    };

    // Listen for app URL open events
    const urlListener = App.addListener('appUrlOpen', handleAppUrl);

    // Also check if app was opened with a URL on launch
    App.getLaunchUrl().then((result) => {
      if (result?.url) {
        handleAppUrl({ url: result.url });
      }
    });

    // Cleanup listener on unmount
    return () => {
      urlListener.then((listener) => listener.remove());
    };
  }, [navigate]);
};

