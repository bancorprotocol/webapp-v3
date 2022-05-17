import { Holding } from 'store/portfolio/v3Portfolio.types';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { DepositV3Modal } from 'elements/earn/pools/poolsTable/v3/DepositV3Modal';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';

export const V3HoldingsItemDeposit = ({ holding }: { holding: Holding }) => {
  const { pool } = holding;
  const isDisabled = toBigNumber(pool.reserveToken.balance ?? 0).isZero();

  return (
    <div>
      <div className="text-secondary">Wallet Balance</div>
      <div className={`mt-6 mb-10 ${isDisabled ? 'text-secondary' : ''}`}>
        {prettifyNumber(pool.reserveToken.balance ?? 0)}{' '}
        {pool.reserveToken.symbol}
      </div>
      <div className="flex justify-center">
        <DepositV3Modal
          pool={pool}
          renderButton={(onClick) => (
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.EXTRASMALL}
              onClick={onClick}
              disabled={isDisabled}
            >
              Deposit
            </Button>
          )}
        />
      </div>
    </div>
  );
};
