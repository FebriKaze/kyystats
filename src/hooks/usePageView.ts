import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface PageViewProps {
  pageType: string;       // 'home' | 'article' | 'statistik' | 'portfolio'
  pageId?: string;        // ID konten
  pageTitle?: string;
}

export const usePageView = ({ pageType, pageId, pageTitle }: PageViewProps) => {
  const lastTrackedId = useRef<string | null>(null);

  useEffect(() => {
    // Kita butuh ID kecuali untuk 'home'
    if (pageType !== 'home' && !pageId) return;

    // Hindari duplikasi track untuk ID yang sama dalam satu mount
    const trackingKey = `${pageType}-${pageId || 'global'}`;
    if (lastTrackedId.current === trackingKey) return;
    lastTrackedId.current = trackingKey;

    const record = async () => {
      try {
        console.log(`[PageView] Melakukan tracking untuk: ${pageType} (${pageId || 'home'})`);
        
        const { data, error } = await supabase.from('page_views').insert([{
          page_type: pageType,
          page_id: pageId || null,
          page_title: pageTitle || null,
        }]);

        if (error) {
          console.error('[PageView] Gagal insert ke Supabase:', error.message);
        } else {
          console.log('[PageView] Berhasil mencatat statistik! ✅');
        }
      } catch (err) {
        console.error('[PageView] Error sistem:', err);
      }
    };

    // Tambahkan sedikit delay agar tidak bentrok dengan loading data lain
    const timeout = setTimeout(record, 1000);
    return () => clearTimeout(timeout);
  }, [pageType, pageId, pageTitle]);
};
