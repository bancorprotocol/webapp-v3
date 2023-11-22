import { memo, useEffect } from 'react';
import ModalFullscreenV3 from 'components/modalFullscreen/modalFullscreenV3';
import V3WithdrawStep1 from 'elements/earn/portfolio/v3/initWithdraw/step1/V3WithdrawStep1';
import V3WithdrawStep3 from 'elements/earn/portfolio/v3/initWithdraw/step3/V3WithdrawStep3';
import V3WithdrawStep4 from 'elements/earn/portfolio/v3/initWithdraw/step4/V3WithdrawStep4';
import V3WithdrawStep2 from 'elements/earn/portfolio/v3/initWithdraw/step2/V3WithdrawStep2';
import { useV3WithdrawModal } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import {
  sendWithdrawEvent,
  setCurrentWithdraw,
  WithdrawEvent,
} from 'services/api/googleTagManager/withdraw';
import {
  getBlockchain,
  getBlockchainNetwork,
  getCurrency,
  getFiat,
} from 'services/api/googleTagManager';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  holding: Holding;
}

const V3WithdrawModal = ({ isOpen, setIsOpen, holding }: Props) => {
  const {
    step,
    onClose,
    setStep,
    inputTkn,
    setInputTkn,
    inputFiat,
    setInputFiat,
    isFiat,
    amount,
    withdrawalFeeInTkn,
    withdrawalFeeInPercent,
    lockDurationInDays,
    requestId,
    setRequestId,
  } = useV3WithdrawModal({ setIsOpen });

  useEffect(() => {
    if (isOpen) {
      setCurrentWithdraw({
        withdraw_pool: holding.pool.name,
        withdraw_blockchain: getBlockchain(),
        withdraw_blockchain_network: getBlockchainNetwork(),
        withdraw_input_type: getFiat(isFiat),
        withdraw_token: holding.pool.name,
        withdraw_display_currency: getCurrency(),
      });
      sendWithdrawEvent(WithdrawEvent.WithdrawPoolClick);
      sendWithdrawEvent(WithdrawEvent.WithdrawAmountView);
    }
  }, [isOpen, isFiat, holding.pool.name]);

  return (
    <ModalFullscreenV3
      title={step === 4 ? 'Complete Withdraw' : 'Begin instant cooldown'}
      isOpen={isOpen}
      setIsOpen={onClose}
    >
      {step === 1 && (
        <V3WithdrawStep1
          setStep={setStep}
          inputTkn={inputTkn}
          setInputTkn={setInputTkn}
          inputFiat={inputFiat}
          setInputFiat={setInputFiat}
          isFiat={isFiat}
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
          isFiat={isFiat}
        />
      )}
      {step === 3 && (
        <V3WithdrawStep3
          amount={amount}
          lockDurationInDays={lockDurationInDays}
          holding={holding}
          setStep={setStep}
          setRequestId={setRequestId}
          isFiat={isFiat}
        />
      )}
      {step === 4 && (
        <V3WithdrawStep4
          onClose={onClose}
          isOpen={isOpen}
          requestId={requestId}
        />
      )}
    </ModalFullscreenV3>
  );
};

export default memo(V3WithdrawModal);
