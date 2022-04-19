import { TopPools } from 'elements/earn/pools/TopPools';
import { PoolsTable } from 'elements/earn/pools/poolsTable/PoolsTable';
import { useState } from 'react';
import { Statistics } from 'elements/earn/pools/Statistics';

export const Pools = () => {
  const [searchInput, setSearchInput] = useState('');

  return (
    <div className="space-y-30 max-w-[1140px] pt-80 mb-20 mx-auto bg-fog dark:bg-black">
      <Statistics />
      <TopPools setSearch={setSearchInput} />
      <PoolsTable search={searchInput} setSearch={setSearchInput} />
    </div>
  );
};
