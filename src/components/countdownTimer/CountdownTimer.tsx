import dayjs from 'dayjs';
import { useInterval } from 'hooks/useInterval';
import { useState } from 'react';
import { formatTime } from 'utils/helperFunctions';

interface CountdownTimerProps {
  date?: number;
  msgEnded?: string;
  intervalSeconds?: number;
  withDays?: boolean;
}

export const CountdownTimer = ({
  date,
  msgEnded = '',
  withDays = false,
  intervalSeconds = 1,
}: CountdownTimerProps) => {
  const now = dayjs().unix() * 1000;
  const [countdown, setCountdown] = useState(date ? date - now : -1);
  const timerEnded = countdown <= 0;
  const interval = intervalSeconds * 1000;

  useInterval(
    () => {
      setCountdown(countdown - interval);
    },
    timerEnded ? null : interval
  );

  return <div>{timerEnded ? msgEnded : formatTime(countdown, withDays)}</div>;
};
