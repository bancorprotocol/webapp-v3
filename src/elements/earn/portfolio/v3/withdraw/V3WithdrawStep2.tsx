import { Button } from 'components/button/Button';

interface Props {
  amount: string;
  setStep: (step: number) => void;
}

export const V3WithdrawStep2 = ({ setStep, amount }: Props) => {
  return (
    <div className="text-center">
      <button onClick={() => setStep(1)}>{'<-'} Change amount</button>
      <h1 className="text-[36px] font-normal my-50">
        Remove <span className="text-primary">{amount} ETH</span> from earning
        rewards
      </h1>
      <div className="flex justify-center">
        <Button className="px-50" onClick={() => setStep(3)}>
          Remove
        </Button>
      </div>
    </div>
  );
};
