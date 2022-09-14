import { useAppSelector } from 'store';
import { useMemo, useState } from 'react';

export const AdminPoolData = () => {
  const allV3Pools = useAppSelector((state) => state.pool.v3Pools);

  const [searchInput, setSearchInput] = useState('');

  const poolFound = useMemo(
    () => allV3Pools.find((p) => p.name === searchInput),
    [allV3Pools, searchInput]
  );

  return (
    <>
      <h2 className="pb-20 text-primary">Pool Database</h2>

      <div>
        <div className="font-semibold">Search by Symbol</div>
        <input
          type="text"
          placeholder={'eg. ETH'}
          className="w-full max-w-[500px] px-10 py-5 rounded-full mt-5 bg-secondary mb-30"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value.trim().toUpperCase())}
        />

        {poolFound && (
          <div className={'text-left'}>
            <pre>{JSON.stringify(poolFound, null, 2)}</pre>
          </div>
        )}
      </div>
    </>
  );
};
