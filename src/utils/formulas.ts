import BigNumber from 'bignumber.js';
import { Token } from 'services/observables/tokens';

export const calcReserve = (from: string, to: string, fee: BigNumber) => {
  return new BigNumber(to)
    .div(new BigNumber(from))
    .times(new BigNumber(1).minus(fee));
};

export const expandToken = (amount: string | number, precision: number) => {
  const trimmed = new BigNumber(amount).toFixed(precision, 1);
  const inWei = new BigNumber(trimmed)
    .times(new BigNumber(10).pow(precision))
    .toFixed(0);
  return inWei;
};

export const shrinkToken = (
  amount: string | number | BigNumber,
  precision: number,
  chopZeros = false
) => {
  const bigNumAmount = new BigNumber(amount);
  if (bigNumAmount.isEqualTo(0)) return '0';
  const res = bigNumAmount
    .div(new BigNumber(10).pow(precision))
    .toFixed(precision, BigNumber.ROUND_DOWN);

  return chopZeros ? new BigNumber(res).toString() : res;
};

export const usdByToken = (
  token: Token,
  amount?: string,
  isToken: boolean = true
): string => {
  if (!token || !token.usdPrice || (!amount && !token.balance)) return '';

  const input = Number(amount ? amount : token.balance);
  const tokenPrice = Number(token.usdPrice);
  return (isToken ? input * tokenPrice : input / tokenPrice).toString();
};

export const calculatePercentageChange = (
  numberNow: number,
  numberBefore: number
): number => {
  return Number(((numberNow / numberBefore - 1) * 100).toFixed(2));
};

export const reduceBySlippage = (
  value: string | number | BigNumber,
  slippage: string | number | BigNumber
) => {
  const bigNumValue = new BigNumber(value);
  const bigNumSlippage = new BigNumber(slippage);
  const one = new BigNumber(1);
  return bigNumValue.times(one.minus(bigNumSlippage)).toString();
};
