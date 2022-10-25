import { useAppSelector } from 'store';
import { useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { wait } from 'utils/pureFunctions';
import { TokenCurrency } from 'store/user/user';

export interface AmountTknFiat {
  tkn: string;
  fiat: string;
}

interface Props {
  setIsOpen: (isOpen: boolean) => void;
}

export const useV3WithdrawModal = ({ setIsOpen }: Props) => {
  const { withdrawalFee, lockDuration } = useAppSelector(
    (state) => state.v3Portfolio.withdrawalSettings
  );
  const tokenCurrency = useAppSelector((state) => state.user.tokenCurrency);
  const isCurrency = tokenCurrency === TokenCurrency.Currency;
  const [step, setStep] = useState(1);
  const [requestId, setRequestId] = useState('');
  const [inputTkn, setInputTkn] = useState('');
  const [inputFiat, setInputFiat] = useState('');

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

  const onClose = async (state: boolean) => {
    setIsOpen(state);
    await wait(500);
    setStep(1);
    setInputTkn('');
    setInputFiat('');
  };

  return {
    amount,
    isCurrency,
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
    requestId,
    setRequestId,
  };
};
