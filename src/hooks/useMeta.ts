import { useEffect } from 'react';

interface MetaProps {
  title?: string;
  description?: string;
}

export const useMeta = ({ title, description }: MetaProps) => {
  useEffect(() => {
    // Update Title
    const baseTitle = 'KyyStats';
    document.title = title ? `${title} | ${baseTitle}` : `${baseTitle} - Data Analysis & Statistics`;

    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || 'Eksplorasi insight mendalam melalui data dan statistik.');
    }

    // Update OGP Title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title || baseTitle);
    }
  }, [title, description]);
};
