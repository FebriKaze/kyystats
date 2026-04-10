import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface PageViewProps {
  pageType: string;       // 'home' | 'article' | 'statistik' | 'portfolio'
  pageId?: string;        // ID konten (opsional untuk home)
  pageTitle?: string;
}

/**
 * Hook untuk mencatat pageview ke Supabase.
 * Hanya mencatat sekali per mount (tidak duplikat saat re-render).
 */
export const usePageView = ({ pageType, pageId, pageTitle }: PageViewProps) => {
  const tracked = useRef(false);

  useEffect(() => {
    // Prevent double-tracking in StrictMode or re-renders
    if (tracked.current) return;
    tracked.current = true;

    const record = async () => {
      try {
        await supabase.from('page_views').insert([{
          page_type: pageType,
          page_id: pageId || null,
          page_title: pageTitle || null,
        }]);
      } catch (e) {
        // Silently fail — tracking should never break the app
        console.warn('PageView tracking failed:', e);
      }
    };

    record();

    return () => {
      tracked.current = false;
    };
  }, [pageType, pageId, pageTitle]);
};
