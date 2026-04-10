import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(src || '');
  const [hasError, setHasError] = useState(false);

  // Sync state when props change
  useEffect(() => {
    setCurrentSrc(src || '');
    setHasError(false);
  }, [src]);

  if (!src) return null;

  const getWebpUrl = (url: string) => {
    if (hasError) return url; // If already failed, don't try webp again
    
    if (url.includes('supabase.co/storage/v1/object/public') && 
        !url.toLowerCase().endsWith('.webp')) {
      return url.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp');
    }
    return url;
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      // When error occurs, it will re-render and getWebpUrl will return the original URL
    }
  };

  return (
    <img
      src={getWebpUrl(currentSrc)}
      alt={alt}
      className={className}
      onError={handleError}
      crossOrigin="anonymous"
      loading="lazy"
      {...props}
    />
  );
};

export default SafeImage;
