import { useMemo, useState } from 'react';

export function useFallbackImage(src: string | undefined, fallbackSrc: string) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const source = useMemo(
    () => (src && !failed ? src : fallbackSrc),
    [failed, fallbackSrc, src]
  );

  const onError = useMemo(
    () => (failed ? undefined : () => setFailed(true)),
    [failed]
  );

  return {
    loaded,
    setLoaded,
    source,
    onError,
  };
}
