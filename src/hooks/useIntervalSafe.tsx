import { useEffect, useRef } from 'react';
import useAsyncEffect from 'use-async-effect';

export const useIntervalSafe = (
  callback: (isMounted: () => boolean) => void,
  delay: null | number,
  leading = true
) => {
  const savedCallback = useRef<(isMounted: () => boolean) => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useAsyncEffect<number | undefined>(
    async (isMounted) => {
        function tick() {
            const current = savedCallback.current;
            current && current(isMounted);
          }
      
          if (delay !== null) {
            if (leading) tick();
            return window.setInterval(tick, delay);
          }
          return undefined;
    },
    (id?: number) => {
        if (id) clearInterval(id);
    },
    [delay, leading]
  );
};
