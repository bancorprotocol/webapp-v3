import { TopPools } from 'elements/earn/pools/TopPools';
import { PoolsTable } from 'elements/earn/pools/PoolsTable';
import { Pool } from 'services/api/bancor';
import { useAppSelector } from 'redux/index';

export const Pools = () => {
  const pools = useAppSelector<Pool[]>((state) => state.bancor.pools);

  return (
    <div className="space-y-30 max-w-[1140px] mx-auto bg-grey-1 dark:bg-blue-3">
      <TopPools pools={pools} />
      <PoolsTable pools={pools} />
    </div>
  );
};
