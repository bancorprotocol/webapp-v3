import { Holding } from 'store/portfolio/v3Portfolio.types';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { V3UnstakeModal } from 'elements/earn/portfolio/v3/holdings/V3UnstakeModal';
import { PopoverV3 } from 'components/popover/PopoverV3';

export const V3HoldingsItemStaked = ({ holding }: { holding: Holding }) => {
  const { pool } = holding;
  const isDisabled = toBigNumber(holding.stakedTokenBalance).isZero();

  return (
    <div>
      <div className="text-secondary flex">
        <IconGift
          className={`w-16 mr-10 ${
            !isDisabled
              ? holding.hasLegacyStake
                ? 'text-warning'
                : 'text-primary'
              : 'text-secondary'
          }`}
        />
        Earning Rewards
      </div>
      <div className="flex items-center space-x-10 pt-6">
        <PopoverV3
          buttonElement={() => (
            <div
              className={`mb-10 text-18 ${isDisabled ? 'text-secondary' : ''}`}
            >
              {prettifyNumber(holding.stakedTokenBalance)}{' '}
              {pool.reserveToken.symbol}
            </div>
          )}
        >
          {holding.stakedTokenBalance} {pool.reserveToken.symbol}
        </PopoverV3>

        <div className={`mt-6 mb-10 text-secondary`}>
          ({prettifyNumber(holding.stakedPoolTokenBalance)} bn
          {pool.reserveToken.symbol})
        </div>
      </div>

      <V3UnstakeModal
        holding={holding}
        renderButton={(onClick) => (
          <Button
            variant={
              holding.hasLegacyStake
                ? ButtonVariant.WARNING
                : ButtonVariant.SECONDARY
            }
            size={ButtonSize.EXTRASMALL}
            disabled={isDisabled}
            onClick={onClick}
            className="md:w-full"
          >
            Manage Rewards
          </Button>
        )}
      />
    </div>
  );
};
