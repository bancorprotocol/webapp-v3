import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { calcFiatValue, calcTknValue } from 'utils/helperFunctions';
import { Token } from 'services/observables/tokens';

const calcOppositeValue = (
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

interface useTokenInputV3Props {
  token: Token;
  setInput: (amount: string) => void;
  setInputOpposite: (amount: string) => void;
  isFiat: boolean;
}

export const useTokenInputV3 = ({
  token,
  setInput,
  setInputOpposite,
  isFiat,
}: useTokenInputV3Props) => {
  const [isFocused, setIsFocused] = useState(false);
  const { symbol, usdPrice, decimals } = useMemo(() => token, [token]);
  const inputUnit = isFiat ? 'USD' : symbol;

  const oppositeUnit = isFiat ? symbol : 'USD';

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setInput(value);
      const oppositeValue = value
        ? calcOppositeValue(isFiat, value, usdPrice, decimals)
        : '';
      setInputOpposite(oppositeValue);
    },
    [decimals, isFiat, setInput, setInputOpposite, usdPrice]
  );

  return { handleChange, inputUnit, oppositeUnit, isFocused, setIsFocused };
};
