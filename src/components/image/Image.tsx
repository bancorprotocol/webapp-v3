import { DetailedHTMLProps, ImgHTMLAttributes } from 'react';
import { classNameGenerator } from 'utils/pureFunctions';
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
  const { source, onError, loaded, setLoaded } = useFallbackImage(src);

  return (
    <img
      {...props}
      src={source}
      alt={alt}
      className={`${className} ${classNameGenerator({
        'animate-pulse': !loaded,
      })}`}
      onLoad={() => setLoaded(true)}
      onError={onError}
      loading={lazy ? 'lazy' : 'eager'}
    />
  );
};
