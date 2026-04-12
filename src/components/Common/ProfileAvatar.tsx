import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ProfileAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
  /** Pixel size for the fallback User icon (Lucide). */
  iconSize?: number;
}

/**
 * Avatar foto profil: jika tidak ada URL, kosong, atau gambar gagal dimuat → ikon profil.
 */
const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  src,
  alt = '',
  className,
  iconSize = 22,
}) => {
  const normalized = typeof src === 'string' ? src.trim() : '';
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [normalized]);

  const showPhoto = normalized.length > 0 && !failed;

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 overflow-hidden',
        className
      )}
      role="img"
      aria-label={alt || 'Foto profil'}
    >
      {showPhoto ? (
        <img
          src={normalized}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        <User size={iconSize} strokeWidth={1.75} aria-hidden className="shrink-0" />
      )}
    </div>
  );
};

export default ProfileAvatar;
