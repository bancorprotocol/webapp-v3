import { useEffect, useState } from 'react';

export const useTopScroll = () => {
  const [isTop, setIsTop] = useState(true);

  useEffect(() => {
    window.onscroll = () => {
      const top = window.pageYOffset === 0;
      if (top !== isTop) setIsTop(top);
    };

    return () => {
      window.onscroll = null;
    };
  }, [isTop]);

  return isTop;
};
