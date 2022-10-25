import { TokenMinimal } from 'services/observables/tokens';
import { useCallback, useState } from 'react';
import { useAppSelector } from 'store/index';
import { debounce } from 'lodash';
import { sanitizeNumberInput } from 'utils/pureFunctions';
import { calcOppositeValue } from 'components/tokenInput/useTokenInputV3';
import { TokenCurrency } from 'store/user/user';

interface useTokenInputV3Props {
  token?: TokenMinimal;
  inputTkn: string;
  setInputTkn: (amount: string) => void;
  inputFiat: string;
  setInputFiat: (amount: string) => void;
  onDebounce?: (amount: string) => void;
}

export interface useTokenInputV3Return {
  handleChange: (val: string) => void;
  inputUnit: string;
  oppositeUnit: string;
  inputTkn: string;
  setInputTkn: (val: string) => void;
  inputFiat: string;
  setInputFiat: (val: string) => void;
  isTyping: boolean;
  token: TokenMinimal;
}

export const useTknFiatInput = ({
  token,
  inputTkn,
  setInputTkn,
  inputFiat,
  setInputFiat,
  onDebounce = () => {},
}: useTokenInputV3Props): useTokenInputV3Return | undefined => {
  const tokenCurrency = useAppSelector((state) => state.user.tokenCurrency);
  const isCurrency = tokenCurrency === TokenCurrency.Currency;
  const symbol = token?.symbol ?? 'N/A';
  const decimals = token?.decimals ?? 18;
  const usdPrice = token?.usdPrice ?? '0';

  const inputUnit = isCurrency ? 'USD' : symbol;

  const oppositeUnit = isCurrency ? symbol : 'USD';
  const [isTyping, setIsTyping] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChangeHandler = useCallback(debounce(onDebounce, 300), [
    token?.address,
    onDebounce,
  ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetIsTyping = useCallback(debounce(setIsTyping, 300), [
    token?.address,
  ]);

  const handleChange = useCallback(
    (val: string) => {
      setIsTyping(true);
      const value = sanitizeNumberInput(val);

      if (isCurrency) {
        const oppositeValue = value
          ? calcOppositeValue(true, value, usdPrice, decimals)
          : '';
        setInputTkn(oppositeValue);
        setInputFiat(value);
        debouncedChangeHandler(oppositeValue);
      } else {
        const oppositeValue = value
          ? calcOppositeValue(false, value, usdPrice, decimals)
          : '';
        setInputTkn(value);
        setInputFiat(oppositeValue);
        debouncedChangeHandler(value);
      }

      value ? debouncedSetIsTyping(false) : setIsTyping(false);
    },
    [
      debouncedSetIsTyping,
      isCurrency,
      usdPrice,
      decimals,
      setInputTkn,
      setInputFiat,
      debouncedChangeHandler,
    ]
  );

  if (!token) return undefined;

  return {
    handleChange,
    inputUnit,
    oppositeUnit,
    setInputTkn,
    setInputFiat,
    inputTkn,
    inputFiat,
    isTyping,
    token,
  };
};
