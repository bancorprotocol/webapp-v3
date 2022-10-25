import { Button } from 'components/button/Button';
import { memo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { AmountTknFiat } from 'elements/earn/portfolio/v3/initWithdraw/useV3WithdrawModal';
import { Holding } from 'store/portfolio/v3Portfolio.types';
import { useV3WithdrawStep3 } from 'elements/earn/portfolio/v3/initWithdraw/step3/useV3WithdrawStep3';

interface Props {
  amount: AmountTknFiat;
  lockDurationInDays: number;
  holding: Holding;
  setStep: (step: number) => void;
  setRequestId: (val: string) => void;
  isFiat: boolean;
}

const V3WithdrawStep3 = ({
  amount,
  lockDurationInDays,
  holding,
  setStep,
  isFiat,
  setRequestId,
}: Props) => {
  const { token, handleButtonClick, txBusy } = useV3WithdrawStep3({
    holding,
    amount,
    setStep,
    setRequestId,
  });

  return (
    <>
      <div className="text-center">
        <h1 className="text-[36px] font-normal my-50 leading-10">
          Start {lockDurationInDays} day cooldown of{' '}
          <span className="text-primary">
            {isFiat
              ? `${prettifyNumber(amount.fiat, true)} USD`
              : `${prettifyNumber(amount.tkn)} ${token.symbol}`}
          </span>
        </h1>
        <div className="flex justify-center">
          <Button
            className="px-50"
            onClick={handleButtonClick}
            disabled={txBusy}
          >
            {txBusy
              ? 'waiting for confirmation ...'
              : `${
                  isFiat
                    ? `${prettifyNumber(amount.tkn)} ${token.symbol} - `
                    : ''
                }Start cooldown`}
          </Button>
        </div>
      </div>
    </>
  );
};

export default memo(V3WithdrawStep3);
