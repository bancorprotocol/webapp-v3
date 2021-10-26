import { UTCTimestamp } from 'lightweight-charts';
import dayjs from 'dayjs';
import { useInterval } from 'hooks/useInterval';
import { useState } from 'react';
import { formatTime } from 'utils/helperFunctions';

interface Props {
  date: UTCTimestamp;
  msgEnded?: string;
  intervalSeconds?: number;
}
export const CountdownTimer = ({
  date,
  msgEnded,
  intervalSeconds = 1,
}: Props) => {
  const now = dayjs();
  const end = dayjs(date);
  const [endMessage, setEndMessage] = useState('');
  const [countdown, setCountdown] = useState(
    dayjs.duration(end.diff(now)).asSeconds()
  );

  const timerEnded = countdown <= 0;

  useInterval(
    () => {
      if (timerEnded) setEndMessage(msgEnded ?? 'Ended');
      else setCountdown(countdown - 1);
    },
    timerEnded ? null : intervalSeconds * 1000
  );

  return <div>{timerEnded ? endMessage : formatTime(countdown)}</div>;
};
