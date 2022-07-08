import { useChainPools } from 'queries/chain/useChainPools';

export const AdminQueryTest = () => {
  const { data: chainData, isLoading, isFetching } = useChainPools();

  return (
    <div className={'text-left'}>
      admin query test
      <div>
        {isFetching && 'fetching...'}
        {isLoading ? (
          'loading...'
        ) : (
          <pre>{JSON.stringify(chainData, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};
