import { TopPools } from 'elements/earn/pools/TopPools';
import { PoolsTable } from 'elements/earn/pools/poolsTable/PoolsTable';
import { useState } from 'react';
import { Statistics } from 'elements/earn/pools/Statistics';
import { Page } from 'components/Page';
import { classNameGenerator } from 'utils/pureFunctions';

export const Pools = () => {
  const [searchInput, setSearchInput] = useState('');
  const [v3Selected, setV3Selected] = useState(true);

  const getTabBtnClasses = (selected: boolean, hidden?: boolean) =>
    classNameGenerator({
      'px-10 py-5 rounded-10': true,
      'bg-white dark:bg-charcoal': selected,
      hidden: hidden,
    });

  const title = 'Earn';
  const subtitle =
    'Deposit your favorite token and earn in the safest decentralized platform.';

  return (
    <Page title={title} subtitle={subtitle}>
      <div className="mb-20">
        <button
          onClick={() => setV3Selected((prev) => !prev)}
          className={getTabBtnClasses(v3Selected)}
        >
          V3
        </button>
        <button
          onClick={() => setV3Selected((prev) => !prev)}
          className={getTabBtnClasses(!v3Selected)}
        >
          V2
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-40">
        <div className={`${v3Selected ? 'col-span-8' : 'col-span-12'}`}>
          <PoolsTable
            v3Selected={v3Selected}
            setV3Selected={setV3Selected}
            search={searchInput}
            setSearch={setSearchInput}
          />
        </div>
        {v3Selected && (
          <div className="hidden lg:block col-span-4 space-y-40">
            <Statistics />
            <TopPools setSearch={setSearchInput} />
          </div>
        )}
      </div>
    </Page>
  );
};
