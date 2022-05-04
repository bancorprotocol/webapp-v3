import { useEffect, useRef } from 'react';

/**
 * Start or stop an interval that fires a callback.
 * Callback will be called immediately when a condition change leads to interval start or stop.
 * @function useConditionalInterval
 * @param {boolean} condition - (must be memoized) only when this condition is true, the interval will be started
 *  - (and stopped as part of destory when condition changes)
 * @param {function} callback - (must be memoized) the callback to be called
 * @param {number} timeout - the delay between calls
 */
export const useConditionalInterval = (
  condition: boolean,
  callback: Function,
  timeout: number
) => {
  const interval = useRef<number | null>(null);

  useEffect(() => {
    if (condition) {
      if (!interval.current) {
        interval.current = window.setInterval(callback, timeout);
        callback();
      }
    } else {
      callback();
    }
    return () => {
      if (interval.current) {
        window.clearInterval(interval.current);
        interval.current = null;
      }
    };
  }, [condition, callback, timeout]);
};
