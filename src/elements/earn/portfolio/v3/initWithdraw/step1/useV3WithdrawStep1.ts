import { useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { calcFiatValue } from 'utils/helperFunctions';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import useAsyncEffect from 'use-async-effect';
import { fetchWithdrawalRequestOutputBreakdown } from 'services/web3/v3/portfolio/withdraw';
import { expandToken } from 'utils/formulas';
import { ContractsApi } from 'services/web3/v3/contractsApi';

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
    () => new BigNumber(holding.tokenBalance).lt(inputTkn),
    [holding.tokenBalance, inputTkn]
  );

  // const showBreakdown = useMemo(
  //   () => new BigNumber(holding.latestProgram?.poolTokenAmountWei || 0).gt(0),
  //   [holding.latestProgram?.poolTokenAmountWei]
  // );

  const showBreakdown = false;

  const percentageUnstaked = useMemo(
    () =>
      new BigNumber(tokenBalance)
        .div(combinedTokenBalance)
        .multipliedBy(100)
        .toFixed(0),
    [combinedTokenBalance, tokenBalance]
  );

  const setBalance = (percentage: 25 | 50 | 75 | 100) => {
    const valueTkn = new BigNumber(holding.tokenBalance)
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

  const [isLoadingWithdrawAmounts, setIsLoadingWithdrawAmounts] =
    useState(false);
  const [withdrawAmounts, setWithdrawAmounts] = useState<{
    tkn: number;
    bnt: number;
    totalAmount: string;
    baseTokenAmount: string;
    bntAmount: string;
  }>();

  const fetchWithdrawAmounts = async (tokenBalance: string) => {
    setIsLoadingWithdrawAmounts(true);
    const poolTokenBalance =
      await ContractsApi.BancorNetworkInfo.read.underlyingToPoolToken(
        pool.poolDltId,
        expandToken(tokenBalance, holding.pool.decimals)
      );
    const res = await fetchWithdrawalRequestOutputBreakdown(
      pool.poolDltId,
      poolTokenBalance.toString()
    );
    setIsLoadingWithdrawAmounts(false);
    return res;
  };

  useAsyncEffect(async () => {
    const res = await fetchWithdrawAmounts(holding.tokenBalance);
    setWithdrawAmounts(res);
  }, [pool.poolDltId, holding.poolTokenBalance]);

  return {
    handleNextStep,
    token: pool.reserveToken,
    setBalance,
    isInputError,
    combinedTokenBalance,
    percentageUnstaked,
    showBreakdown,
    withdrawAmounts,
    fetchWithdrawAmounts,
    isLoadingWithdrawAmounts,
    setIsLoadingWithdrawAmounts,
  };
};
