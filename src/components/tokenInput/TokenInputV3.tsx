import { memo, useMemo } from 'react';
import { Image } from 'components/image/Image';
import { prettifyNumber } from 'utils/helperFunctions';
import { useResizeTokenInput } from 'components/tokenInput/useResizeTokenInput';
import { useTokenInputV3 } from 'components/tokenInput/useTokenInputV3';
import { Token } from 'services/observables/tokens';
import useDimensions from 'hooks/useDimensions';

export interface TokenInputV3Props {
  token: Token;
  inputTkn: string;
  setInputTkn: (amount: string) => void;
  inputFiat: string;
  setInputFiat: (amount: string) => void;
  isFiat: boolean;
  isError: boolean;
}

const TokenInputV3 = ({
  token,
  inputTkn,
  setInputTkn,
  inputFiat,
  setInputFiat,
  isFiat,
  isError,
}: TokenInputV3Props) => {
  const { handleChange, inputUnit, oppositeUnit, isFocused, setIsFocused } =
    useTokenInputV3({
      token,
      setInputTkn,
      setInputFiat,
      isFiat,
    });

  const { observe: containerRef, width: containerWidth } = useDimensions();
  const { observe: oppositeRef, width: oppositeWidth } = useDimensions();
  const { observe: symbolRef, width: symbolWidth } = useDimensions();
  const maxInputWidth = useMemo(
    () => containerWidth - symbolWidth - oppositeWidth - 120,
    [oppositeWidth, symbolWidth, containerWidth]
  );
  const { inputRef, helperRef } = useResizeTokenInput({
    isFiat,
    inputTkn,
  });
  return (
    <div
      ref={containerRef}
      onClick={() => {
        inputRef.current && inputRef.current.focus();
      }}
      className={`relative flex items-center border-2 rounded-20 text-[36px] bg-white dark:bg-charcoal ${
        isFocused ? 'border-primary' : 'border-fog dark:border-grey'
      } ${isError ? 'border-error text-error' : ''}`}
    >
      <Image
        src={token.logoURI}
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
        value={isFiat ? inputFiat : inputTkn}
        placeholder="0.00"
        onChange={handleChange}
        className={`${
          inputTkn === '' ? 'min-w-[80px]' : 'min-w-[10px]'
        } ml-[80px] outline-none h-[75px] bg-white dark:bg-charcoal rounded-20 font-inherit`}
        style={{
          maxWidth: maxInputWidth,
        }}
      />
      <span ref={symbolRef} className="text-16 ml-5">
        {inputUnit}
      </span>
      <span ref={oppositeRef} className="absolute text-12 right-[10px]">
        {prettifyNumber(isFiat ? inputTkn : inputFiat, !isFiat)} {oppositeUnit}
      </span>
    </div>
  );
};

export default memo(TokenInputV3);
