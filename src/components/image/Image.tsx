import { DetailedHTMLProps, ImgHTMLAttributes } from 'react';
import { useImage } from 'hooks/useImage';
import { ropstenImage } from 'services/web3/config';

type ImgAttributes = DetailedHTMLProps<
  ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
>;

interface ImageProps extends ImgAttributes {
  src?: string;
  alt: string;
  lazy?: boolean;
  fallbackSrc?: string;
}

export const Image = ({
  src,
  alt,
  lazy = true,
  fallbackSrc = ropstenImage,
  ...props
}: ImageProps) => {
  const { hasLoaded, source } = useImage(src ?? ropstenImage, fallbackSrc);

  return hasLoaded ? (
    <img {...props} src={source} alt={alt} loading={lazy ? 'lazy' : 'eager'} />
  ) : (
    <div className={`loading-skeleton ${props.className}`} />
  );
};
