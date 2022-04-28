import { TopPools } from 'elements/earn/pools/TopPools';
import { PoolsTable } from 'elements/earn/pools/poolsTable/PoolsTable';
import { useState } from 'react';
import { Statistics } from 'elements/earn/pools/Statistics';
import { Page } from 'components/Page';

export const Pools = () => {
  const [searchInput, setSearchInput] = useState('');
  const title = 'Earn';
  const subtitle =
    'Deposit your favorite token and earn in the safest decentralized platform.';

  return (
    <Page title={title} subtitle={subtitle}>
      <div className="lg:grid lg:grid-cols-12 lg:gap-40">
        <div className="col-span-8">
          <PoolsTable search={searchInput} setSearch={setSearchInput} />
        </div>
        <div className="hidden lg:block col-span-4 space-y-40">
          <Statistics />
          <TopPools setSearch={setSearchInput} />
        </div>
      </div>
    </Page>
  );
};
