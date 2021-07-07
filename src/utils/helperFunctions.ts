import BigNumber from 'bignumber.js';
import numeral from 'numeral';

export const prettifyNumber = (
  num: number | string | BigNumber,
  usd = false
): string => {
  const bigNum = new BigNumber(num);
  if (usd) {
    if (bigNum.lte(0)) return '$0.00';
    else if (bigNum.lt(0.01)) return '< $0.01';
    else if (bigNum.gt(100)) return numeral(bigNum).format('$0,0', Math.floor);
    else return numeral(bigNum).format('$0,0.00');
  } else {
    if (bigNum.lte(0)) return '0';
    else if (bigNum.gte(1000)) return numeral(bigNum).format('0,0', Math.floor);
    else if (bigNum.gte(2))
      return numeral(bigNum).format('0,0.[00]', Math.floor);
    else if (bigNum.lt(0.000001)) return '< 0.000001';
    else return numeral(bigNum).format('0.[000000]', Math.floor);
  }
};
