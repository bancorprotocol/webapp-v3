import { useCallback, useEffect, useState } from 'react';
import { useInterval } from 'hooks/useInterval';

interface TickerProps {
  id: string;
  children: JSX.Element | JSX.Element[];
  speedMs?: number;
}

export const Ticker = ({ id, children, speedMs = 60 }: TickerProps) => {
  const [pause, setPause] = useState(false);
  const [pos, setPos] = useState(0);

  const [scrollBack, setScrollBack] = useState(false);

  useInterval(async () => {
    const element = document.getElementById(`${id}`);
    if (element && !pause) {
      const scrollWidth = element.scrollWidth;
      const clientWidth = element.clientWidth;
      const scrollPosition = element.scrollLeft;
      const scrollTotal = scrollWidth - clientWidth;
      const nextPosition = scrollBack ? pos - 1 : pos + 1;

      if (scrollTotal === scrollPosition) setScrollBack(true);
      if (scrollPosition === 0) setScrollBack(false);

      element.scrollLeft = nextPosition;
      setPos(nextPosition);
    }
  }, speedMs);

  const isScrolling = () => {
    const element = document.getElementById(`${id}`);
    if (!element) return;
    const scrollStart = element.scrollLeft;
    setTimeout(() => {
      const scrollPos = element.scrollLeft;
      if (scrollStart !== scrollPos) isScrolling();
      else setPause(false);
    }, 100);
  };

  const handleScroll = useCallback((event: Event) => {
    const target = event.target as HTMLDivElement;
    if (target) setPos(target.scrollLeft);
  }, []);

  useEffect(() => {
    const element = document.getElementById(`${id}`);
    element && element.addEventListener('scroll', handleScroll);
    return () => {
      element && element.removeEventListener('scroll', handleScroll);
    };
  }, [id, handleScroll]);

  return (
    <div
      id={id}
      onMouseEnter={() => setPause(true)}
      onMouseLeave={() => setPause(false)}
      onTouchStart={() => setPause(true)}
      onTouchEnd={() => isScrolling()}
      className="overflow-x-scroll pb-15 px-10 hide-scrollbar"
    >
      {children}
    </div>
  );
};
