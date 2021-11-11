import dayjs from 'dayjs';
import { useInterval } from 'hooks/useInterval';
import { useState } from 'react';
import { formatTime } from 'utils/helperFunctions';

interface CountdownTimerProps {
  date?: number; //In seconds
  msgEnded?: string;
  intervalSeconds?: number;
}

export const CountdownTimer = ({
  date,
  msgEnded,
  intervalSeconds = 1,
}: CountdownTimerProps) => {
  const now = dayjs().unix();
  const [countdown, setCountdown] = useState(date ? date - now : -1);
  const timerEnded = countdown <= 0;

  useInterval(
    () => {
      setCountdown(countdown - 1);
    },
    timerEnded ? null : intervalSeconds * 1000
  );

  return <div>{timerEnded ? msgEnded ?? 'Ended' : formatTime(countdown)}</div>;
};
