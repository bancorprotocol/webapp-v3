import { useChainPoolIds } from 'queries/chain/useChainPoolIds';
import { usePoolPick } from 'queries/chain/usePoolPick';

export const AdminQueryTest = () => {
  const { data: poolIds } = useChainPoolIds();

  const { getMany } = usePoolPick([
    'fees',
    'symbol',
    'balance',
    'stakedBalance',
  ]);

  const { data: all, isLoading } = getMany(poolIds || []);

  return (
    <div className={'text-left'}>
      admin query test
      <div>
        {isLoading ? 'loading...' : <pre>{JSON.stringify(all, null, 2)}</pre>}
      </div>
    </div>
  );
};
