import { Holding } from 'store/portfolio/v3Portfolio.types';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { V3UnstakeModal } from 'elements/earn/portfolio/v3/holdings/V3UnstakeModal';

export const V3HoldingsItemStaked = ({ holding }: { holding: Holding }) => {
  const { pool } = holding;
  const isDisabled = toBigNumber(holding.stakedTokenBalance).isZero();

  return (
    <div>
      <div className="text-secondary">Joined Rewards</div>
      <div className={`mt-6 mb-10 ${isDisabled ? 'text-secondary' : ''}`}>
        {prettifyNumber(holding.stakedPoolTokenBalance)}{' '}
        {`bn${pool.reserveToken.symbol}`}
      </div>
      <div className="flex justify-center">
        <V3UnstakeModal
          holding={holding}
          renderButton={(onClick) => (
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.EXTRASMALL}
              disabled={isDisabled}
              onClick={onClick}
            >
              Manage
            </Button>
          )}
        />
      </div>
    </div>
  );
};
