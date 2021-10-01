import { Pool, Token } from 'services/observables/tokens';
import { getSpaceAvailable } from 'services/web3/contracts/liquidityProtection/wrapper';
import { useCallback, useEffect, useState } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { useInterval } from 'hooks/useInterval';

interface Props {
  pool: Pool;
  token: Token;
}

export const AddLiquiditySingleSpaceAvailable = ({ pool, token }: Props) => {
  const [spaceAvailableBnt, setSpaceAvailableBnt] = useState('');
  const [spaceAvailableTkn, setSpaceAvailableTkn] = useState('');

  useInterval(
    async () => {
      await fetchData();
    },
    15000,
    false
  );

  const fetchData = useCallback(async () => {
    try {
      const spaceAvailable = await getSpaceAvailable(
        pool.pool_dlt_id,
        token.decimals
      );
      setSpaceAvailableBnt(spaceAvailable.bnt);
      setSpaceAvailableTkn(spaceAvailable.tkn);
    } catch (e) {
      console.error('failed to fetch space available with msg: ', e.message);
    }
  }, [pool.pool_dlt_id, token.decimals]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <div className="p-20 rounded bg-blue-0 dark:bg-blue-5 my-20">
      <div className="flex justify-between dark:text-grey-0">
        <span className="font-medium">Space Available</span>{' '}
        <div className="text-right">
          <div>
            {prettifyNumber(spaceAvailableTkn)} {token && token.symbol}
          </div>
          <div>{prettifyNumber(spaceAvailableBnt)} BNT</div>
        </div>
      </div>
    </div>
  );
};
