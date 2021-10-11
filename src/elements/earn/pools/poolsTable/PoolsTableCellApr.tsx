import { Pool } from 'services/observables/tokens';

export const PoolsTableCellApr = (pool: Pool) => {
  const aprOne = pool.reserves[0].rewardApr || 0;
  const aprTwo = pool.reserves[1].rewardApr || 0;
  const symbolOne = pool.reserves[0].symbol;
  const symbolTwo = pool.reserves[1].symbol;
  const formatApr = (rewardApr: number) => (rewardApr + pool.apr).toFixed(2);
  return (
    <div className="flex items-center w-full">
      <div className="flex justify-start w-full">
        <span className="text-right w-full">{`${symbolOne} ${formatApr(aprOne)}%`}</span>
        <span className="text-center px-10">|</span>
        <span className="text-left w-full">{`${symbolTwo} ${formatApr(aprTwo)}%`}</span>
      </div>
    </div>
  );
};