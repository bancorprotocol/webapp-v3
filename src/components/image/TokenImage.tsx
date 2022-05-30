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
}

export const TokenImage = ({ src, alt, lazy = true, ...props }: ImageProps) => {
  const { hasLoaded, source } = useImage(src ?? ropstenImage);

  return hasLoaded ? (
    <img {...props} src={source} alt={alt} loading={lazy ? 'lazy' : 'eager'} />
  ) : (
    <div className={`loading-skeleton ${props.className}`} />
  );
};
