import BigNumber from 'bignumber.js';
import { ChangeEvent } from 'react';
import { sanitizeNumberInput } from 'utils/pureFunctions';
import { TokenInputV3Props } from 'components/tokenInput/TokenInputV3';

export const useTokenInputV3 = ({
  amount,
  usdPrice,
  isFiat,
  setAmount,
}: TokenInputV3Props) => {
  const amountUsd = amount ? new BigNumber(amount).times(usdPrice) : ``;
  const inputValue = isFiat ? amountUsd.toString() : amount;
  const inputUnit = isFiat ? 'USD' : 'ETH';
  const oppositeValue = isFiat ? amount : amountUsd.toString();
  const oppositeUnit = isFiat ? 'ETH' : 'USD';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const amount = isFiat
      ? new BigNumber(value).div(usdPrice).toString()
      : value;
    setAmount(sanitizeNumberInput(amount));
  };

  return { handleChange, inputValue, inputUnit, oppositeValue, oppositeUnit };
};
