import { useState } from 'react';

export function useFallbackImage(src: string | undefined, fallbackSrc: string) {
  const [failed, setFailed] = useState(false);
  const imageOnErrorHandler = (
    // @ts-ignore
    event: SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setFailed(true);
  };

  return {
    source: src && !failed ? src : fallbackSrc,
    onError: failed ? undefined : imageOnErrorHandler,
  };
}
