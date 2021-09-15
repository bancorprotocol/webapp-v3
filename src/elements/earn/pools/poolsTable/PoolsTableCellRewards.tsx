import { Pool } from 'services/observables/tokens';
import { Tooltip } from 'components/tooltip/Tooltip';
import { CountdownTimer } from 'components/countdownTimer/CountdownTimer';
import { ReactComponent as IconClock } from 'assets/icons/clock.svg';

export const PoolsTableCellRewards = (pool: Pool) => {
  const aprOne = pool.reserves[0].rewardApr;
  const aprTwo = pool.reserves[1].rewardApr;
  const symbolOne = pool.reserves[0].symbol;
  const symbolTwo = pool.reserves[1].symbol;
  const ends_at = pool.reward?.ends_at;
  return aprOne && aprTwo && ends_at ? (
    <div className="flex items-center w-full">
      <Tooltip
        content={
          <span>
            Rewards end in <CountdownTimer date={ends_at} />
          </span>
        }
        button={<IconClock className="w-10" />}
      />
      <div className="flex justify-center w-full">
        <span className="text-right w-full">{`${symbolOne} ${aprOne.toFixed(
          2
        )}%`}</span>
        <span className="text-center px-10">|</span>
        <span className="text-left w-full">{`${symbolTwo} ${aprTwo.toFixed(
          2
        )}%`}</span>
      </div>
    </div>
  ) : (
    ''
  );
};
