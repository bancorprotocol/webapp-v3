import { SyntheticEvent, useState } from 'react';
import { classNameGenerator } from 'utils/pureFunctions';
import { ropstenImage } from 'services/web3/config';

interface ImageProps {
  src?: string;
  alt: string;
  className: string;
  lazy?: boolean;
}

const imageOnErrorHandler = (
  event: SyntheticEvent<HTMLImageElement, Event>
) => {
  event.currentTarget.src = ropstenImage;
  event.currentTarget.onerror = null;
};

export const Image = ({ src, alt, className, lazy = true }: ImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={src ? src : ropstenImage}
      alt={loaded ? alt : ''}
      className={`${className} ${classNameGenerator({
        'animate-pulse': !loaded,
      })}`}
      onLoad={() => setLoaded(true)}
      onError={imageOnErrorHandler}
      loading={lazy ? 'lazy' : 'eager'}
    />
  );
};
