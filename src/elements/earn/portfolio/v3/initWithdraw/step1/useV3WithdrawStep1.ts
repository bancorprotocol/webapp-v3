import { useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { calcFiatValue } from 'utils/helperFunctions';
import { Holding } from 'store/portfolio/v3Portfolio.types';

interface Props {
  holding: Holding;
  inputTkn: string;
  setInputTkn: (inputTkn: string) => void;
  setInputFiat: (inputFiat: string) => void;
  setStep: (step: number) => void;
}
export const useV3WithdrawStep1 = ({
  holding,
  inputTkn,
  setInputTkn,
  setInputFiat,
  setStep,
}: Props) => {
  const { pool, combinedTokenBalance, tokenBalance } = holding;
  const isInputError = useMemo(
    () => new BigNumber(combinedTokenBalance).lt(inputTkn),
    [combinedTokenBalance, inputTkn]
  );

  const showBreakdown = useMemo(
    () => new BigNumber(holding.latestProgram?.poolTokenAmountWei || 0).gt(0),
    [holding.latestProgram?.poolTokenAmountWei]
  );

  const percentageUnstaked = useMemo(
    () =>
      new BigNumber(tokenBalance)
        .div(combinedTokenBalance)
        .multipliedBy(100)
        .toFixed(0),
    [combinedTokenBalance, tokenBalance]
  );

  const setBalance = (percentage: 25 | 50 | 75 | 100) => {
    const valueTkn = new BigNumber(combinedTokenBalance)
      .times(percentage / 100)
      .toString();
    const valueFiat = calcFiatValue(valueTkn, pool.reserveToken.usdPrice);
    setInputTkn(valueTkn);
    setInputFiat(valueFiat);
  };

  const skipStep2 = useMemo(
    () => new BigNumber(inputTkn).lte(tokenBalance),
    [inputTkn, tokenBalance]
  );

  const handleNextStep = () => {
    if (skipStep2) {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  return {
    handleNextStep,
    token: pool.reserveToken,
    setBalance,
    isInputError,
    combinedTokenBalance,
    percentageUnstaked,
    showBreakdown,
  };
};
