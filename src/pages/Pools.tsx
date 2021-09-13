import { TopPools } from 'elements/earn/pools/TopPools';
import { PoolsTable } from 'elements/earn/pools/PoolsTable';
import { useAppSelector } from 'redux/index';
import { Pool } from 'services/observables/tokens';
import { useState } from 'react';
import { Statistics } from 'elements/earn/pools/Statistics';

export const Pools = () => {
  const [searchInput, setSearchInput] = useState('');
  const pools = useAppSelector<Pool[]>((state) => state.bancor.pools);

  return (
    <div className="space-y-30 max-w-[1140px] mx-auto bg-grey-1 dark:bg-blue-3">
      <Statistics />
      <TopPools pools={pools} setSearch={setSearchInput} />
      <PoolsTable
        pools={pools}
        search={searchInput}
        setSearch={setSearchInput}
      />
    </div>
  );
};
