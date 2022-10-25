import { memo, useEffect } from 'react';
import V3WithdrawStep1 from 'elements/earn/portfolio/v3/initWithdraw/step1/V3WithdrawStep1';
import V3WithdrawStep3 from 'elements/earn/portfolio/v3/initWithdraw/step3/V3WithdrawStep3';
import V3WithdrawStep4 from 'elements/earn/portfolio/v3/initWithdraw/step4/V3WithdrawStep4';
import V3WithdrawStep2 from 'elements/earn/portfolio/v3/initWithdraw/step2/V3WithdrawStep2';
import { useV3WithdrawModal } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { ModalFullscreen, ModalNames } from 'modals';
import {
  getBlockchain,
  getBlockchainNetwork,
  getFiat,
  getCurrency,
} from 'services/api/googleTagManager';
import {
  setCurrentWithdraw,
  sendWithdrawEvent,
  WithdrawEvent,
} from 'services/api/googleTagManager/withdraw';
import { useModal } from 'hooks/useModal';
import { useAppSelector } from 'store';
import { getIsModalOpen, getModalData } from 'store/modals/modals';
import { CurrencySelection } from 'elements/layoutHeader/CurrencySelection';

interface V3WithdrawProps {
  holding: Holding;
}
const V3WithdrawModal = () => {
  const { popModal } = useModal();
  const isOpen = useAppSelector((state) =>
    getIsModalOpen(state, ModalNames.V3Withdraw)
  );

  const props = useAppSelector<V3WithdrawProps | undefined>((state) =>
    getModalData(state, ModalNames.V3Withdraw)
  );
  const holding = props?.holding;

  const {
    step,
    onClose,
    setStep,
    inputTkn,
    setInputTkn,
    inputFiat,
    setInputFiat,
    isCurrency,
    amount,
    withdrawalFeeInTkn,
    withdrawalFeeInPercent,
    lockDurationInDays,
    requestId,
    setRequestId,
  } = useV3WithdrawModal({ setIsOpen: popModal });

  useEffect(() => {
    if (isOpen && holding) {
      setCurrentWithdraw({
        withdraw_pool: holding.pool.name,
        withdraw_blockchain: getBlockchain(),
        withdraw_blockchain_network: getBlockchainNetwork(),
        withdraw_input_type: getFiat(isCurrency),
        withdraw_token: holding.pool.name,
        withdraw_display_currency: getCurrency(),
      });
      sendWithdrawEvent(WithdrawEvent.WithdrawPoolClick);
      sendWithdrawEvent(WithdrawEvent.WithdrawAmountView);
    }
  }, [isOpen, isCurrency, holding]);

  if (!holding) return null;

  return (
    <ModalFullscreen
      title={step === 4 ? 'Complete Withdraw' : 'Begin instant cooldown'}
      isOpen={isOpen}
      setIsOpen={onClose}
      titleElement={step !== 4 && <CurrencySelection />}
    >
      {step === 1 && (
        <V3WithdrawStep1
          setStep={setStep}
          inputTkn={inputTkn}
          setInputTkn={setInputTkn}
          inputFiat={inputFiat}
          setInputFiat={setInputFiat}
          isFiat={isCurrency}
          holding={holding}
          withdrawalFeeInPercent={withdrawalFeeInPercent}
          withdrawalFeeInTkn={withdrawalFeeInTkn}
          amount={amount}
          setRequestId={setRequestId}
          lockDurationInDays={lockDurationInDays}
        />
      )}
      {step === 2 && (
        <V3WithdrawStep2
          setStep={setStep}
          amount={amount}
          holding={holding}
          isFiat={isCurrency}
        />
      )}
      {step === 3 && (
        <V3WithdrawStep3
          amount={amount}
          lockDurationInDays={lockDurationInDays}
          holding={holding}
          setStep={setStep}
          setRequestId={setRequestId}
          isFiat={isCurrency}
        />
      )}
      {step === 4 && (
        <V3WithdrawStep4
          onClose={onClose}
          isOpen={isOpen}
          requestId={requestId}
        />
      )}
    </ModalFullscreen>
  );
};

export default memo(V3WithdrawModal);
