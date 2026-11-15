import React, { useState } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  priority?: boolean;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc = '/images/fallback_patagonia.svg',
  priority = false,
  ...rest
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(src);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Normalize legacy /src/assets/images paths to /images/
  const normalizeSrc = (url: string) => {
    if (!url) return fallbackSrc;
    if (url.startsWith('/src/assets/images/')) {
      const filename = url.replace('/src/assets/images/', '');
      return `/images/${filename}`;
    }
    return url;
  };

  const finalSrc = hasError ? fallbackSrc : normalizeSrc(currentSrc);

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setCurrentSrc(fallbackSrc);
        }
      }}
      onLoad={() => setIsLoaded(true)}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-90'} transition-opacity duration-300`}
      {...rest}
    />
  );
};
