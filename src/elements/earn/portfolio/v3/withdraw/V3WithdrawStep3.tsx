import { Button } from 'components/button/Button';
import { memo } from 'react';

interface Props {
  amount: string;
  setStep: (step: number) => void;
}

const V3WithdrawStep3 = ({ setStep, amount }: Props) => {
  const cooldownPeriod = 7;
  return (
    <div className="text-center">
      <h1 className="text-[36px] font-normal my-50">
        Start {cooldownPeriod} day cooldown of{' '}
        <span className="text-primary">{amount} ETH</span>
      </h1>
      <div className="flex justify-center">
        <Button className="px-50" onClick={() => setStep(4)}>
          Start cooldown
        </Button>
      </div>
    </div>
  );
};

export default memo(V3WithdrawStep3);
