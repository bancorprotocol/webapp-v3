import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { usePoolPick } from 'queries/chain/usePoolPick';
import { useMemo } from 'react';

export const AdminQueryTest = () => {
  const { data: poolIds, isLoading, isFetching } = useChainPoolIds();

  const { getMany } = usePoolPick([
    'poolDltId',
    'symbol',
    'fees',
    'latestProgram',
  ]);

  const all = useMemo(() => {
    return getMany(poolIds || []);
  }, [getMany, poolIds]);

  return (
    <div className={'text-left'}>
      admin query test
      <div>
        {isFetching && 'fetching...'}
        {isLoading ? 'loading...' : <pre>{JSON.stringify(all, null, 2)}</pre>}
      </div>
    </div>
  );
};
