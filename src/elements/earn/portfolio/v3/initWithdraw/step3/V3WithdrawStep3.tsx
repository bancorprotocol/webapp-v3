import { Button } from 'components/button/Button';
import { memo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { AmountTknFiat } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';

interface Props {
  amount: AmountTknFiat;
  lockDurationInDays: number;
  initWithdraw: () => void;
  txBusy: boolean;
}

const V3WithdrawStep3 = ({
  amount,
  lockDurationInDays,
  initWithdraw,
  txBusy,
}: Props) => {
  return (
    <div className="text-center">
      <h1 className="text-[36px] font-normal my-50">
        Start {lockDurationInDays} day cooldown of{' '}
        <span className="text-primary">{prettifyNumber(amount.tkn)} ETH</span>
      </h1>
      <div className="flex justify-center">
        <Button className="px-50" onClick={initWithdraw} disabled={txBusy}>
          {txBusy ? 'waiting for confirmation ...' : 'Start cooldown'}
        </Button>
      </div>
    </div>
  );
};

export default memo(V3WithdrawStep3);
