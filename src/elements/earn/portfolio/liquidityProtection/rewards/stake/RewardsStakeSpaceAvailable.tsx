import { Pool } from 'services/observables/tokens';
import { useCallback, useEffect, useState } from 'react';
import { getSpaceAvailable } from 'services/web3/liquidity/liquidity';
import { prettifyNumber } from 'utils/helperFunctions';
import { useInterval } from 'hooks/useInterval';

interface Props {
  pool: Pool;
}

export const RewardsStakeSpaceAvailable = ({ pool }: Props) => {
  const [spaceAvailable, setSpaceAvailable] = useState('');

  useInterval(
    async () => {
      await fetchData();
    },
    15000,
    false
  );

  const fetchData = useCallback(async () => {
    const spaceAvailable = await getSpaceAvailable(pool.pool_dlt_id, 0);
    setSpaceAvailable(spaceAvailable.bnt);
  }, [pool.pool_dlt_id]);

  useEffect(() => {
    void fetchData();
  }, [fetchData, pool.pool_dlt_id]);

  return (
    <div className="p-20 rounded bg-blue-0 dark:bg-blue-5 mt-20">
      <div className="flex justify-between dark:text-grey-0">
        <span className="font-medium">Space Available</span>
        <div className="text-right">{prettifyNumber(spaceAvailable)} BNT</div>
      </div>
    </div>
  );
};
