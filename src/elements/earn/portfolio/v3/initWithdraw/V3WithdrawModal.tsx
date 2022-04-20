import { memo } from 'react';
import ModalFullscreenV3 from 'components/modalFullscreen/modalFullscreenV3';
import V3WithdrawStep1 from 'elements/earn/portfolio/v3/initWithdraw/step1/V3WithdrawStep1';
import V3WithdrawStep3 from 'elements/earn/portfolio/v3/initWithdraw/step3/V3WithdrawStep3';
import V3WithdrawStep4 from 'elements/earn/portfolio/v3/initWithdraw/step4/V3WithdrawStep4';
import V3WithdrawStep2 from 'elements/earn/portfolio/v3/initWithdraw/step2/V3WithdrawStep2';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { useV3WithdrawModal } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  holdingToWithdrawId: string;
}

const V3WithdrawModal = ({ isOpen, setIsOpen, holdingToWithdrawId }: Props) => {
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
    initWithdraw,
    txBusy,
    holding,
  } = useV3WithdrawModal({ holdingToWithdrawId, setIsOpen });

  return (
    <ModalFullscreenV3
      title="Begin 7 day cooldown"
      isOpen={isOpen}
      setIsOpen={onClose}
      titleElement={<SwapSwitch />}
    >
      {step === 1 && (
        <V3WithdrawStep1
          setStep={setStep}
          inputTkn={inputTkn}
          setInputTkn={setInputTkn}
          inputFiat={inputFiat}
          setInputFiat={setInputFiat}
          isFiat={isFiat}
          holdingToWithdraw={holding!}
          withdrawalFeeInPercent={withdrawalFeeInPercent}
          withdrawalFeeInTkn={withdrawalFeeInTkn}
        />
      )}
      {step === 2 && (
        <V3WithdrawStep2 setStep={setStep} amount={amount} holding={holding!} />
      )}
      {step === 3 && (
        <V3WithdrawStep3
          txBusy={txBusy}
          amount={amount}
          lockDurationInDays={lockDurationInDays}
          initWithdraw={initWithdraw}
          holdingToWithdraw={holding!}
        />
      )}
      {step === 4 && (
        <V3WithdrawStep4
          onClose={onClose}
          lockDurationInDays={lockDurationInDays}
        />
      )}
    </ModalFullscreenV3>
  );
};

export default memo(V3WithdrawModal);
