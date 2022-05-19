import { Holding } from 'store/portfolio/v3Portfolio.types';
import { useState } from 'react';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import V3WithdrawModal from 'elements/earn/portfolio/v3/initWithdraw/V3WithdrawModal';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';

export const V3HoldingsItemWithdraw = ({ holding }: { holding: Holding }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { pool } = holding;

  const isDisabled = toBigNumber(holding.tokenBalance).isZero();

  return (
    <>
      <V3WithdrawModal
        holding={holding}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
      <div>
        <div className="text-secondary">Withdrawal</div>
        <div className={`mt-6 mb-10 ${isDisabled ? 'text-secondary' : ''}`}>
          {prettifyNumber(holding.tokenBalance)} {pool.reserveToken.symbol}
        </div>
        <div className="flex justify-center">
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.ExtraSmall}
            disabled={isDisabled}
            onClick={() => setIsOpen(true)}
          >
            Withdraw
          </Button>
        </div>
      </div>
    </>
  );
};
