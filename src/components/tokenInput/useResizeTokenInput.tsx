import { useEffect, useRef } from 'react';
import { sanitizeNumberInput } from 'utils/pureFunctions';

interface UseResizeTokenInputProps {
  isFiat: boolean;
  input: string;
}

export const useResizeTokenInput = ({
  isFiat,
  input,
}: UseResizeTokenInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const helperRef = useRef<HTMLElement>(null);

  const resize = () => {
    if (inputRef.current && helperRef.current) {
      const length = inputRef.current.value.length;
      let fontSize: string;

      if (length < 9) {
        fontSize = '36px';
      } else if (length < 15) {
        fontSize = '30px';
      } else {
        fontSize = '24px';
      }

      inputRef.current.style.fontSize = fontSize;
      helperRef.current.style.fontSize = fontSize;

      helperRef.current.textContent = sanitizeNumberInput(
        inputRef.current.value
      );
      inputRef.current.style.width = helperRef.current.offsetWidth + 'px';
    }
  };

  useEffect(() => {
    resize();
    const inputRefCurrent = inputRef.current;
    if (inputRefCurrent) {
      inputRefCurrent.focus();
      inputRefCurrent.addEventListener('input', resize);
    }

    return () => {
      if (inputRefCurrent) {
        inputRefCurrent.removeEventListener('input', resize);
      }
    };
  }, [isFiat, input]);

  return { inputRef, helperRef };
};
