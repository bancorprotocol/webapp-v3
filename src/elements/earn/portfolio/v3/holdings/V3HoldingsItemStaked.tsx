import { Holding } from 'store/portfolio/v3Portfolio.types';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { ReactComponent as IconGift } from 'assets/icons/gift.svg';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { ModalNames } from 'modals';
import { useDispatch } from 'react-redux';
import { pushModal } from 'store/modals/modals';

export const V3HoldingsItemStaked = ({ holding }: { holding: Holding }) => {
  const dispatch = useDispatch();
  const { pool } = holding;
  const isDisabled = toBigNumber(holding.stakedTokenBalance).isZero();

  if (!holding.hasLegacyStake && !pool.latestProgram?.isActive) {
    return null;
  }

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

        <div className={`mb-10 text-secondary`}>
          ({prettifyNumber(holding.stakedPoolTokenBalance)} bn
          {pool.reserveToken.symbol})
        </div>
      </div>

      <Button
        variant={ButtonVariant.Tertiary}
        size={ButtonSize.Full}
        disabled={isDisabled}
        onClick={() =>
          dispatch(
            pushModal({
              modalName: ModalNames.V3Unstake,
              data: { holding },
            })
          )
        }
        className="h-[39px]"
      >
        Manage Rewards
      </Button>
    </div>
  );
};
