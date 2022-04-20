import { useState } from 'react';
import { useInterval } from 'hooks/useInterval';

export const useDynamicText = (texts: string[], interval: number = 1500) => {
  const [currentIndex, setCurrentIndex] = useState(-1);

  useInterval(() => {
    setCurrentIndex(currentIndex === texts.length - 1 ? 0 : currentIndex + 1);
  }, interval);

  return texts[currentIndex];
};
