import React, { useState, useEffect } from 'react';
import { ImageIcon, BarChart3 } from 'lucide-react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(src || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setCurrentSrc(src || '');
    setHasError(false);
  }, [src]);

  const isFlourish = src?.includes('flourish.studio') || src?.includes('flo.uri.sh');

  if (!src || hasError || isFlourish) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 text-slate-300 ${className}`}>
        {isFlourish ? <BarChart3 size={20} /> : <ImageIcon size={20} />}
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
