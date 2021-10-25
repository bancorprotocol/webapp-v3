import { UTCTimestamp } from 'lightweight-charts';
import dayjs from 'dayjs';
import { useInterval } from 'hooks/useInterval';
import { useEffect, useState } from 'react';
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
  const [formatted, setFormatted] = useState('');
  const [hasEnded, setHasEnded] = useState(false);
  const [countdown, setCountdown] = useState(
    dayjs.duration(end.diff(now)).asSeconds()
  );

  useInterval(
    () => {
      if (countdown !== 0) setCountdown(countdown - 1);
      else {
        setFormatted(msgEnded ?? 'Ended');
        setHasEnded(true);
      }
    },
    hasEnded ? null : intervalSeconds * 1000
  );

  return <div>{formatTime(countdown)}</div>;
};
