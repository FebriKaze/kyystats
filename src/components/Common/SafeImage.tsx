import React, { useState, useEffect } from 'react';
import { ImageIcon, BarChart3 } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  isFlourish?: boolean;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className, isFlourish, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(src || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || '');
    setHasError(false);
  }, [src]);

  // Kalau jelas-jelas link Flourish atau kosong + flourish flag, kasih ikon chart
  if (isFlourish || (src && src.includes('flourish.studio'))) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 text-primary/40 ${className}`}>
        <BarChart3 size={24} strokeWidth={1.5} />
      </div>
    );
  }

  if (!src || hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 text-slate-300 dark:text-slate-700 ${className}`}>
        <ImageIcon size={24} strokeWidth={1.5} />
      </div>
    );
  }

  const getWebpUrl = (url: string) => {
    if (url.includes('supabase.co/storage/v1/object/public') && 
        !url.toLowerCase().endsWith('.webp')) {
      return url.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp');
    }
    return url;
  };

  return (
    <img
      src={getWebpUrl(currentSrc)}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
      crossOrigin="anonymous"
      loading="lazy"
      {...props}
    />
  );
};

export default SafeImage;
