import { ModalFullscreenV3 } from 'components/modalFullscreen/modalFullscreenV3';
import { V3WithdrawStep1 } from 'elements/earn/portfolio/v3/withdraw/V3WithdrawStep1';
import { useState } from 'react';
import { V3WithdrawStep2 } from 'elements/earn/portfolio/v3/withdraw/V3WithdrawStep2';
import { V3WithdrawStep3 } from 'elements/earn/portfolio/v3/withdraw/V3WithdrawStep3';
import { V3WithdrawStep4 } from 'elements/earn/portfolio/v3/withdraw/V3WithdrawStep4';
import { wait } from 'utils/pureFunctions';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const V3WithdrawModal = ({ isOpen, setIsOpen }: Props) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');

  const onClose = async (state: boolean) => {
    setIsOpen(state);
    await wait(500);
    setStep(1);
    setAmount('');
  };

  return (
    <ModalFullscreenV3
      title="Begin 7 day cooldown"
      isOpen={isOpen}
      setIsOpen={onClose}
    >
      {step === 1 && (
        <V3WithdrawStep1
          setStep={setStep}
          amount={amount}
          setAmount={setAmount}
        />
      )}
      {step === 2 && <V3WithdrawStep2 setStep={setStep} amount={amount} />}
      {step === 3 && <V3WithdrawStep3 setStep={setStep} amount={amount} />}
      {step === 4 && <V3WithdrawStep4 onClose={onClose} />}
    </ModalFullscreenV3>
  );
};
