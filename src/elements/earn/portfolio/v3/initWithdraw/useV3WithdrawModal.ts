import { useAppSelector } from 'redux/index';
import { useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { wait } from 'utils/pureFunctions';
import { Holding } from 'redux/portfolio/v3Portfolio.types';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { utils } from 'ethers';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { useDispatch } from 'react-redux';

export interface AmountTknFiat {
  tkn: string;
  fiat: string;
}

interface Props {
  holding: Holding;
  setIsOpen: (isOpen: boolean) => void;
}

export const useV3WithdrawModal = ({ holding, setIsOpen }: Props) => {
  const dispatch = useDispatch();
  const account = useAppSelector((state) => state.user.account);
  const { withdrawalFee, lockDuration } = useAppSelector(
    (state) => state.v3Portfolio.withdrawalSettings
  );
  const isFiat = useAppSelector((state) => state.user.usdToggle);
  const [step, setStep] = useState(1);
  const [inputTkn, setInputTkn] = useState('');
  const [inputFiat, setInputFiat] = useState('');
  const [txBusy, setTxBusy] = useState(false);

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
    setTxBusy(true);
    try {
      const inputAmountInPoolToken =
        await ContractsApi.BancorNetworkInfo.read.underlyingToPoolToken(
          holding.poolId,
          utils.parseUnits(amount.tkn, holding.token.decimals)
        );
      const res = await ContractsApi.BancorNetwork.write.initWithdrawal(
        holding.poolTokenId,
        inputAmountInPoolToken
      );
      await res.wait();
      setStep(4);
      await updatePortfolioData(dispatch, account!);
    } catch (e) {
      console.error('initWithdraw failed', e);
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
  };
};
