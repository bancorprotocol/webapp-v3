import BigNumber from 'bignumber.js';
import { calcReserve } from './formulas';

describe('calculate reserve spot', () => {
  test('variations', () => {
    expect(calcReserve('1', '2', new BigNumber(0.1)).toFixed(1)).toBe('1.8');
    expect(calcReserve('1', '4', new BigNumber(0.1)).toFixed(1)).toBe('3.6');
    expect(
      calcReserve('60000', '100000', new BigNumber(0.0002)).toFixed(1)
    ).toBe('1.7');
  });
});
