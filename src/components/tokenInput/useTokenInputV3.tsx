import BigNumber from 'bignumber.js';
import { ChangeEvent, useCallback, useState } from 'react';
import { TokenInputV3Props } from 'components/tokenInput/TokenInputV3';

const calcOppositeValue = (value: string, usdPrice: string, toUsd: boolean) => {
  if (!value) {
    return value;
  }

  if (toUsd) {
    return new BigNumber(value).times(usdPrice).toString();
  } else {
    return new BigNumber(value).div(usdPrice).toString();
  }
};

export const useTokenInputV3 = ({
  amount,
  usdPrice,
  isFiat,
  setAmount,
  symbol,
}: TokenInputV3Props) => {
  const [amountUsd, setAmountUsd] = useState(
    calcOppositeValue(amount, usdPrice, true)
  );
  const inputValue = isFiat ? amountUsd : amount;
  const inputUnit = isFiat ? 'USD' : symbol;

  const oppositeValue = isFiat ? amount : amountUsd;
  const oppositeUnit = isFiat ? symbol : 'USD';

  const handleTknChange = useCallback(
    (value: string) => {
      console.log('triggered');
      setAmount(value);
      const oppositeValue = calcOppositeValue(value, usdPrice, true);
      setAmountUsd(oppositeValue);
    },
    [setAmount, usdPrice]
  );

  const handleFiatChange = useCallback(
    (value: string) => {
      setAmountUsd(value);
      const oppositeValue = calcOppositeValue(value, usdPrice, false);
      setAmount(oppositeValue);
    },
    [setAmount, usdPrice]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      if (isFiat) {
        handleFiatChange(value);
      } else {
        handleTknChange(value);
      }
    },
    [handleFiatChange, handleTknChange, isFiat]
  );

  return { handleChange, inputValue, inputUnit, oppositeValue, oppositeUnit };
};
