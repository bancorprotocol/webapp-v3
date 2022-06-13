import { Pool } from 'services/observables/pools';

export const PoolsTableCellApr = (pool: Pool) => {
  const aprOne = pool.reserves[0].rewardApr || 0;
  const aprTwo = pool.reserves[1].rewardApr || 0;
  const symbolOne = pool.reserves[0].symbol;
  const symbolTwo = pool.reserves[1].symbol;
  const formatApr = (rewardApr: number) => (rewardApr + pool.apr_7d).toFixed(2);
  return (
    <div className="flex items-center">
      <span>{`${symbolOne} ${formatApr(aprOne)}%`}</span>
      <span className="px-10">|</span>
      <span>{`${symbolTwo} ${formatApr(aprTwo)}%`}</span>
    </div>
  );
};
