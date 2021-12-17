import dayjs from 'dayjs';
import { useInterval } from 'hooks/useInterval';
import { useState } from 'react';
import { formatTime } from 'utils/helperFunctions';

interface CountdownTimerProps {
  date?: number;
  msgEnded?: string;
  interval?: number;
  onEnded?: () => void;
}

export const CountdownTimer = ({
  date,
  msgEnded = '',
  interval = 1000,
  onEnded,
}: CountdownTimerProps) => {
  const now = dayjs().unix() * 1000;
  const [countdown, setCountdown] = useState(date ? date - now : -1);
  const timerEnded = countdown <= 0;

  useInterval(
    () => {
      setCountdown(countdown - interval);
      if (onEnded && countdown <= interval) onEnded();
    },
    timerEnded ? null : interval
  );

  return <div>{timerEnded ? msgEnded : formatTime(countdown)}</div>;
};
