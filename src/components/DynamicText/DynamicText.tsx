import { useState } from 'react';
import { useInterval } from 'hooks/useInterval';

export const DynamicText = ({
  texts,
  interval = 1500,
}: {
  texts: string[];
  interval?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(-1);

  useInterval(() => {
    setCurrentIndex(currentIndex === texts.length - 1 ? 0 : currentIndex + 1);
  }, interval);

  return <>{texts[currentIndex]}</>;
};
