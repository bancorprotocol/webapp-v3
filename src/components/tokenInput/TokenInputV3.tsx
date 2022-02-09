import { useEffect, useRef, useState } from 'react';
import { Image } from 'components/image/Image';
import { sanitizeNumberInput } from 'utils/pureFunctions';

interface Props {
  amount: string;
  setAmount: (amount: string) => void;
}

export const TokenInputV3 = ({ amount, setAmount }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const helperRef = useRef<HTMLElement>(null);
  const [isFocused, setIsFocused] = useState(false);

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
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.addEventListener('input', resize);
    }
  }, []);

  return (
    <div>
      <div>Amount: {amount}</div>
      <div
        onClick={() => {
          inputRef.current && inputRef.current.focus();
        }}
        className={`relative flex items-center my-10 border-2 rounded-20 text-[36px] ${
          isFocused ? 'border-primary' : 'border-graphite'
        }`}
      >
        <Image
          src={''}
          alt={'Token Logo'}
          className="absolute w-[40px] h-[40px] ml-20"
        />
        <span
          ref={helperRef}
          className="absolute h-0 overflow-hidden whitespace-pre"
        />
        <input
          ref={inputRef}
          type="text"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={amount}
          placeholder="0.00"
          onChange={(e) => {
            setAmount(sanitizeNumberInput(e.target.value));
          }}
          className={`${
            amount === '' ? 'min-w-[80px]' : 'min-w-[10px]'
          } max-w-[400px] ml-[80px] outline-none h-[75px] rounded-20 font-inherit`}
        />
        <span className="text-16 ml-5">ETH</span>
      </div>
    </div>
  );
};
