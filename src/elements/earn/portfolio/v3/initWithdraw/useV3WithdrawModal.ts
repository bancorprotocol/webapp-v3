import { useAppSelector } from 'redux/index';
import { useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { wait } from 'utils/pureFunctions';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { useDispatch } from 'react-redux';
import { expandToken } from 'utils/formulas';
import { ErrorCode } from 'services/web3/types';
import {
  initWithdrawNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { getPortfolioHoldings } from 'redux/portfolio/v3Portfolio';

export interface AmountTknFiat {
  tkn: string;
  fiat: string;
}

interface Props {
  holdingToWithdrawId: string;
  setIsOpen: (isOpen: boolean) => void;
}

export const useV3WithdrawModal = ({
  holdingToWithdrawId,
  setIsOpen,
}: Props) => {
  const dispatch = useDispatch();
  const account = useAppSelector((state) => state.user.account);
  const { withdrawalFee, lockDuration } = useAppSelector(
    (state) => state.v3Portfolio.withdrawalSettings
  );
  const holdings = useAppSelector(getPortfolioHoldings);
  const isFiat = useAppSelector((state) => state.user.usdToggle);
  const [step, setStep] = useState(1);
  const [inputTkn, setInputTkn] = useState('');
  const [inputFiat, setInputFiat] = useState('');
  const [txBusy, setTxBusy] = useState(false);

  const holding = useMemo(
    () => holdings.find((h) => h.poolId === holdingToWithdrawId),
    [holdingToWithdrawId, holdings]
  );

  const amount: AmountTknFiat = useMemo(
    () => ({ tkn: inputTkn, fiat: inputFiat }),
    [inputTkn, inputFiat]
  );

  const lockDurationInDays = useMemo(
    () => lockDuration / 60 / 60 / 24,
    [lockDuration]
  );

  const withdrawalFeeInPercent = useMemo(
    () => (withdrawalFee * 100).toFixed(2),
    [withdrawalFee]
  );

  const withdrawalFeeInTkn = useMemo(() => {
    if (inputTkn) {
      return new BigNumber(inputTkn).times(withdrawalFee).toString();
    } else {
      return '0';
    }
  }, [inputTkn, withdrawalFee]);

  const initWithdraw = async () => {
    if (!holding) {
      console.error(`Holding with ID: ${holdingToWithdrawId} not found`);
      return;
    }
    setTxBusy(true);
    const maxBalanceWithTolerance = new BigNumber(amount.tkn).times(0.99);
    const isWithdrawingMax = new BigNumber(holding.tokenBalance).gt(
      maxBalanceWithTolerance
    );
    const tokenAmount = expandToken(amount.tkn, holding.token.decimals);
    try {
      const inputAmountInPoolToken =
        await ContractsApi.BancorNetworkInfo.read.underlyingToPoolToken(
          holding.poolId,
          tokenAmount
        );
      const tx = await ContractsApi.BancorNetwork.write.initWithdrawal(
        holding.poolTokenId,
        isWithdrawingMax
          ? expandToken(holding.poolTokenBalance, 18)
          : inputAmountInPoolToken
      );
      initWithdrawNotification(
        dispatch,
        tx.hash,
        amount.tkn,
        holding.token.symbol
      );
      setStep(4);
      await updatePortfolioData(dispatch, account);
    } catch (e: any) {
      console.error('initWithdraw failed', e);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      }
    } finally {
      setTxBusy(false);
    }
  };

  const onClose = async (state: boolean) => {
    setIsOpen(state);
    await wait(500);
    setStep(1);
    setInputTkn('');
    setInputFiat('');
  };

  return {
    amount,
    isFiat,
    inputTkn,
    setInputTkn,
    inputFiat,
    setInputFiat,
    step,
    setStep,
    onClose,
    lockDurationInDays,
    withdrawalFeeInPercent,
    withdrawalFee,
    withdrawalFeeInTkn,
    initWithdraw,
    txBusy,
    holding,
  };
};
