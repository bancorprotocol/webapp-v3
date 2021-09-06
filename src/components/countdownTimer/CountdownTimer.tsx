import { UTCTimestamp } from 'lightweight-charts';
import dayjs from 'dayjs';
import { useInterval } from 'hooks/useInterval';
import { useState } from 'react';

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
  const [formatted, setFormatted] = useState('');
  const [hasEnded, setHasEnded] = useState(false);

  const countdown = () => {
    const now = dayjs();
    const end = dayjs(date);
    const countdown = dayjs
      .duration(end.diff(now))
      .format('M[m] D[d] HH[h] mm[m] ss[s]');
    if (countdown.includes('-')) return null;
    return countdown;
  };

  useInterval(
    () => {
      const res = countdown();
      if (res) return setFormatted(res);
      setFormatted(msgEnded ?? '');
      setHasEnded(true);
    },
    hasEnded ? null : intervalSeconds * 1000
  );

  return <div>{formatted}</div>;
};
