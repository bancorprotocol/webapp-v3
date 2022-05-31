import { useState, useEffect, useMemo } from 'react';
import { ropstenImage } from 'services/web3/config';

export const useImage = (
  src: string = ropstenImage,
  fallbackSrc: string = ropstenImage
) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const source = useMemo(
    () => (src && !hasError ? src : fallbackSrc),
    [fallbackSrc, hasError, src]
  );

  useEffect(() => {
    setHasLoaded(false);
    setHasError(false);

    const image = new Image();
    image.src = src;

    const handleError = () => {
      setHasError(true);
      setHasLoaded(true);
    };

    const handleLoad = () => {
      setHasLoaded(true);
      setHasError(false);
    };

    image.addEventListener('error', handleError);
    image.addEventListener('load', handleLoad);

    return () => {
      image.removeEventListener('error', handleError);
      image.removeEventListener('load', handleLoad);
    };
  }, [src]);

  return { hasLoaded, hasError, source };
};
