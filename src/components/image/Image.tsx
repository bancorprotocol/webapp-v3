import { DetailedHTMLProps, ImgHTMLAttributes, useState } from 'react';
import { classNameGenerator } from 'utils/pureFunctions';
import { ropstenImage } from 'services/web3/config';
import { useFallbackImage } from 'components/image/useFallbackImage';

type ImgAttributes = DetailedHTMLProps<
  ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

interface ImageProps extends ImgAttributes {
  src?: string;
  alt: string;
  className: string;
  lazy?: boolean;
}

export const Image = ({
  src,
  alt,
  className,
  lazy = true,
  ...props
}: ImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const { source, onError } = useFallbackImage(src, ropstenImage);

  return (
    <img
      {...props}
      src={source}
      alt={loaded ? alt : ''}
      className={`${className} ${classNameGenerator({
        'animate-pulse': !loaded,
      })}`}
      onLoad={() => setLoaded(true)}
      onError={onError}
      loading={lazy ? 'lazy' : 'eager'}
    />
  );
};
