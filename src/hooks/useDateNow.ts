import { useEffect, useState } from 'react';

interface Props {
  intervalMs?: number;
}

export const useDateNow = ({ intervalMs }: Props = {}): Date => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, intervalMs || 1000);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return now;
};
