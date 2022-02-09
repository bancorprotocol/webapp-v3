import { memo } from 'react';
import { Image } from 'components/image/Image';
import { prettifyNumber } from 'utils/helperFunctions';
import { useResizeTokenInput } from 'components/tokenInput/useResizeTokenInput';
import { useTokenInputV3 } from 'components/tokenInput/useTokenInputV3';
import { Token } from 'services/observables/tokens';

interface TokenInputV3Props {
  token: Token;
  input: string;
  setInput: (amount: string) => void;
  inputOpposite: string;
  setInputOpposite: (amount: string) => void;
  isFiat: boolean;
}

const TokenInputV3 = ({
  token,
  input,
  setInput,
  inputOpposite,
  setInputOpposite,
  isFiat,
}: TokenInputV3Props) => {
  const { handleChange, inputUnit, oppositeUnit, isFocused, setIsFocused } =
    useTokenInputV3({
      token,
      setInput,
      setInputOpposite,
      isFiat,
    });
  const { inputRef, helperRef } = useResizeTokenInput({ isFiat, input });

  return (
    <div
      onClick={() => {
        inputRef.current && inputRef.current.focus();
      }}
      className={`relative flex items-center my-10 border-2 rounded-20 text-[36px] bg-white ${
        isFocused ? 'border-primary' : 'border-graphite'
      }`}
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
        value={isFiat ? input : inputOpposite}
        placeholder="0.00"
        onChange={handleChange}
        className={`${
          input === '' ? 'min-w-[80px]' : 'min-w-[10px]'
        } max-w-[400px] ml-[80px] outline-none h-[75px] rounded-20 font-inherit`}
      />
      <span className="text-16 ml-5">{inputUnit}</span>
      <span className="absolute text-12 right-[10px]">
        ~{prettifyNumber(isFiat ? inputOpposite : input, !isFiat)}{' '}
        {oppositeUnit}
      </span>
    </div>
  );
};

export default memo(TokenInputV3);
