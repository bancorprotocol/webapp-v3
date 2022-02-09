import { memo, useState } from 'react';
import { Image } from 'components/image/Image';
import { prettifyNumber } from 'utils/helperFunctions';
import { useResizeTokenInput } from 'components/tokenInput/useResizeTokenInput';
import { useTokenInputV3 } from 'components/tokenInput/useTokenInputV3';

export interface TokenInputV3Props {
  amount: string;
  setAmount: (amount: string) => void;
  usdPrice: string;
  isFiat: boolean;
}

const TokenInputV3 = ({
  amount,
  setAmount,
  usdPrice,
  isFiat,
}: TokenInputV3Props) => {
  const { handleChange, inputValue, inputUnit, oppositeValue, oppositeUnit } =
    useTokenInputV3({ amount, usdPrice, isFiat, setAmount });
  const { inputRef, helperRef } = useResizeTokenInput({ isFiat, inputValue });
  const [isFocused, setIsFocused] = useState(false);

  return (
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
      <span className="absolute text-12 right-[10px]">
        ~${prettifyNumber(oppositeValue)} {oppositeUnit}
      </span>
      <span
        ref={helperRef}
        className="absolute h-0 overflow-hidden whitespace-pre"
      />
      <input
        ref={inputRef}
        type="text"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={inputValue}
        placeholder="0.00"
        onChange={handleChange}
        className={`${
          amount === '' ? 'min-w-[80px]' : 'min-w-[10px]'
        } max-w-[400px] ml-[80px] outline-none h-[75px] rounded-20 font-inherit`}
      />
      <span className="text-16 ml-5">{inputUnit}</span>
    </div>
  );
};

export default memo(TokenInputV3);
