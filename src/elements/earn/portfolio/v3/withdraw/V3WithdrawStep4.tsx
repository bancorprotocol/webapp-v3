import { Button, ButtonVariant } from 'components/button/Button';
import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';

interface Props {
  onClose: (state: boolean) => void;
}

export const V3WithdrawStep4 = ({ onClose }: Props) => {
  const cooldownPeriod = 7;
  return (
    <div className="text-center">
      <span className="flex justify-center text-primary items-center text-20">
        <IconCheck className="w-30 mr-10" /> Cooldown began
      </span>
      <h1 className="text-[36px] font-normal my-50">
        Remember to come back after {cooldownPeriod} days
      </h1>
      <div className="flex justify-center">
        <Button
          variant={ButtonVariant.SECONDARY}
          className="px-50"
          onClick={() => onClose(false)}
        >
          Return to portfolio
        </Button>
      </div>
    </div>
  );
};
