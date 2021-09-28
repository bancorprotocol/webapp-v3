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

  useInterval(async () => {
    await init();
  }, 15000);

  const init = useCallback(async () => {
    const spaceAvailable = await getSpaceAvailable(
      pool.pool_dlt_id,
      token.decimals
    );
    setSpaceAvailableBnt(spaceAvailable.bnt);
    setSpaceAvailableTkn(spaceAvailable.tkn);
  }, [token.decimals, pool.pool_dlt_id]);

  useEffect(() => {
    void init();
  }, [pool.pool_dlt_id, init]);

  return (
    <div className="p-20 rounded bg-blue-0 my-20">
      <div className="flex justify-between">
        <span className="font-semibold">Space Available</span>{' '}
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
