import BigNumber from 'bignumber.js';

export const calcReserve = (from: string, to: string, fee: BigNumber) => {
  return new BigNumber(to)
    .div(new BigNumber(from))
    .times(new BigNumber(1).minus(fee));
};
