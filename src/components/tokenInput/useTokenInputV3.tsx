import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { calcFiatValue, calcTknValue } from 'utils/helperFunctions';
import { Token } from 'services/observables/tokens';
import { sanitizeNumberInput } from 'utils/pureFunctions';

export const calcOppositeValue = (
  isFiat: boolean,
  amount: string,
  usdPrice: string | null,
  decimals: number
) => {
  if (isFiat) {
    return calcTknValue(amount, usdPrice, decimals);
  } else {
    return calcFiatValue(amount, usdPrice);
  }
};

export interface useTokenInputV3Props {
  token: Token;
  setInputTkn: (amount: string) => void;
  setInputFiat: (amount: string) => void;
  isFiat: boolean;
}

export const useTokenInputV3 = ({
  token,
  setInputTkn,
  setInputFiat,
  isFiat,
}: useTokenInputV3Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const { symbol, usdPrice, decimals } = useMemo(() => token, [token]);
  const inputUnit = isFiat ? 'USD' : symbol;

  const oppositeUnit = isFiat ? symbol : 'USD';

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = sanitizeNumberInput(e.target.value);

      if (isFiat) {
        const oppositeValue = value
          ? calcOppositeValue(true, value, usdPrice, decimals)
          : '';
        setInputTkn(oppositeValue);
        setInputFiat(value);
      } else {
        const oppositeValue = value
          ? calcOppositeValue(false, value, usdPrice, decimals)
          : '';
        setInputTkn(value);

        setInputFiat(oppositeValue);
      }
    },
    [decimals, isFiat, setInputTkn, setInputFiat, usdPrice]
  );

  return { handleChange, inputUnit, oppositeUnit, isFocused, setIsFocused };
};
