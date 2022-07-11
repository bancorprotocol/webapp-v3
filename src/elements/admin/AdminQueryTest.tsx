import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { usePoolPick } from 'queries/chain/usePoolPick';

export const AdminQueryTest = () => {
  const { data: poolIds, isLoading, isFetching } = useChainPoolIds();

  const test = usePoolPick(poolIds ? poolIds[0] : '', ['poolDltId', 'symbol']);

  return (
    <div className={'text-left'}>
      admin query test
      <div>
        {isFetching && 'fetching...'}
        {isLoading ? 'loading...' : <pre>{JSON.stringify(test, null, 2)}</pre>}
      </div>
    </div>
  );
};
