import BigNumber from 'bignumber.js';

export const shrinkToken = (
  amount: string | number,
  precision: number,
  chopZeros = false
) => {
  if (!Number.isInteger(precision))
    throw new Error(
      `Must be passed integer to shrink token, received ${precision}`
    );
  const res = new BigNumber(amount)
    .div(new BigNumber(10).pow(precision))
    .toFixed(precision, BigNumber.ROUND_DOWN);

  return chopZeros ? new BigNumber(res).toString() : res;
};
