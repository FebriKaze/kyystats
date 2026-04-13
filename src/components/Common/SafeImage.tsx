import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(src || '');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Sanitasi URL: Cegah error URI malformed jika ada '%' ilegal
    try {
      if (src) {
        // Coba decode untuk validasi, kalau gagal berarti malformed
        decodeURIComponent(src);
        setCurrentSrc(src);
      } else {
        setCurrentSrc('');
      }
    } catch (e) {
      console.error('Malformed URI detected in SafeImage:', src);
      setHasError(true);
    }
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 ${className}`}>
        <span className="text-[10px] font-black uppercase opacity-50">No Image</span>
      </div>
    );
  }

  const getWebpUrl = (url: string) => {
    if (hasError) return url;
    try {
      if (url.includes('supabase.co/storage/v1/object/public') && 
          !url.toLowerCase().endsWith('.webp')) {
        return url.replace(/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/i, '.webp');
      }
    } catch (e) {}
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
