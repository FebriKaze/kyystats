import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className, ...props }) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [triedWebp, setTriedWebp] = useState(false);

  // Function to try converting to webp if it's a Supabase image
  const getWebpUrl = (url: string) => {
    if (url.includes('supabase.co/storage/v1/object/public') && !url.toLowerCase().endsWith('.webp')) {
      return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    }
    return url;
  };

  const handleError = () => {
    if (!triedWebp && currentSrc.toLowerCase().endsWith('.webp')) {
      // If webp failed, try the original URL (assume it might be jpg/png)
      // We'll revert .webp back to the original if we can, 
      // but usually the original 'src' passed to the component should be the backup.
      setCurrentSrc(src); 
      setTriedWebp(true);
    }
  };

  return (
    <img
      src={getWebpUrl(currentSrc)}
      alt={alt}
      className={className}
      onError={handleError}
      crossOrigin="anonymous"
      {...props}
    />
  );
};

export default SafeImage;
