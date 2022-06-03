import { Button, ButtonVariant } from 'components/button/Button';
import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';
import { memo } from 'react';

interface Props {
  onClose: (state: boolean) => void;
  lockDurationInDays: number;
}

const V3WithdrawStep4 = ({ onClose, lockDurationInDays }: Props) => {
  return (
    <div className="text-center">
      <span className="flex justify-center text-primary items-center text-20">
        <IconCheck className="w-30 mr-10" /> Cooldown began
      </span>
      <h1 className="text-[36px] font-normal my-50 leading-10">
        Remember to come back after {lockDurationInDays} days
      </h1>
      <div className="flex justify-center">
        <Button
          variant={ButtonVariant.Secondary}
          className="px-50"
          onClick={() => onClose(false)}
        >
          Return to portfolio
        </Button>
      </div>
    </div>
  );
};

export default memo(V3WithdrawStep4);
