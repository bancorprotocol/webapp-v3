import { useMemo, useState } from 'react';
import { ropstenImage } from 'services/web3/config';

export function useFallbackImage(src?: string) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const imageOnErrorHandler = () => {
    setFailed(true);
  };

  const source = useMemo(
    () => (src && !failed ? src : ropstenImage),
    [failed, src]
  );

  const onError = useMemo(
    () => (failed ? undefined : imageOnErrorHandler),
    [failed]
  );

  return {
    loaded,
    setLoaded,
    source,
    onError,
  };
}
