import { TopPools } from 'elements/earn/pools/TopPools';
import { PoolsTable } from 'elements/earn/pools/poolsTable/PoolsTable';
import { useState } from 'react';
import { Statistics } from 'elements/earn/pools/Statistics';

export const Pools = () => {
  const [searchInput, setSearchInput] = useState('');

  return (
    <div className="space-y-30 max-w-[1140px] mx-auto bg-grey-1 dark:bg-blue-3">
      <Statistics />
      <TopPools setSearch={setSearchInput} />
      <PoolsTable search={searchInput} setSearch={setSearchInput} />
    </div>
  );
};
