import { ChangeEvent, useCallback, useState } from 'react';
import { calcFiatValue, calcTknValue } from 'utils/helperFunctions';
import { sanitizeNumberInput } from 'utils/pureFunctions';
import { usePoolPick } from 'queries/index';

export const calcOppositeValue = (
  isFiat: boolean,
  amount: string,
  usdPrice: string | null,
  decimals: number
) => {
  if (amount === '') return '';

  if (isFiat) return calcTknValue(amount, usdPrice, decimals);

  return calcFiatValue(amount, usdPrice);
};

export interface useTokenInputV3Props {
  dltId: string;
  setInputTkn: (amount: string) => void;
  setInputFiat: (amount: string) => void;
  isFiat: boolean;
}

export const useTokenInputV3 = ({
  dltId,
  setInputTkn,
  setInputFiat,
  isFiat,
}: useTokenInputV3Props) => {
  const { getOne } = usePoolPick(['symbol', 'decimals', 'rate']);
  const { data } = getOne(dltId);
  const symbol = data?.symbol;
  const usdPrice = data?.rate?.usd;
  const decimals = data?.decimals;
  const [isFocused, setIsFocused] = useState(false);
  const inputUnit = isFiat ? 'USD' : symbol;

  const oppositeUnit = isFiat ? symbol : 'USD';

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = sanitizeNumberInput(e.target.value);
      if (!usdPrice || !decimals) {
        console.error('Missing or still loading data for calculation');
        return;
      }

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
