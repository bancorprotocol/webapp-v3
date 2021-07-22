import { useState } from 'react';
import { classNameGenerator } from 'utils/pureFunctions';

interface ImageProps {
  src?: string;
  alt: string;
  className: string;
  lazy?: boolean;
}
export const Image = ({ src, alt, className, lazy = true }: ImageProps) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={loaded ? alt : ''}
      className={`${className} ${classNameGenerator({
        'animate-pulse': !loaded,
      })}`}
      onLoad={() => setLoaded(true)}
      loading={lazy ? 'lazy' : 'eager'}
    />
  );
};
