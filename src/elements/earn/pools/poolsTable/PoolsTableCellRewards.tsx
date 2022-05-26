import { CountdownTimer } from 'components/countdownTimer/CountdownTimer';
import { ReactComponent as IconClock } from 'assets/icons/clock.svg';
import { Pool } from 'services/observables/pools';
import { PopoverV3 } from 'components/popover/PopoverV3';

export const PoolsTableCellRewards = (pool: Pool) => {
  const aprOne = pool.reserves[0].rewardApr;
  const aprTwo = pool.reserves[1].rewardApr;
  const ends_at = pool.reward?.ends_at;
  return aprOne && aprTwo && ends_at ? (
    <div className="flex items-center">
      <PopoverV3 buttonElement={() => <IconClock className="w-18 h-20" />}>
        <span>
          Rewards end in <CountdownTimer date={ends_at} />
        </span>
      </PopoverV3>
      <span className="ml-5">Active</span>
    </div>
  ) : (
    ''
  );
};
