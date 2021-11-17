import dayjs from 'dayjs';
import { useInterval } from 'hooks/useInterval';
import { useState } from 'react';
import { formatTime } from 'utils/helperFunctions';

interface CountdownTimerProps {
  date?: number;
  msgEnded?: string;
  interval?: number;
  withDays?: boolean;
}

export const CountdownTimer = ({
  date,
  msgEnded = '',
  withDays = false,
  interval = 1000,
}: CountdownTimerProps) => {
  const now = dayjs().unix() * 1000;
  const [countdown, setCountdown] = useState(date ? date - now : -1);
  const timerEnded = countdown <= 0;

  useInterval(
    () => {
      setCountdown(countdown - interval);
    },
    timerEnded ? null : interval
  );

  return <div>{timerEnded ? msgEnded : formatTime(countdown, withDays)}</div>;
};
