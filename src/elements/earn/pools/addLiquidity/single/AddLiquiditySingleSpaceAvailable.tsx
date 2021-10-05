import { Pool, Token } from 'services/observables/tokens';
import {
  checkPriceDeviationTooHigh,
  fetchBntNeededToOpenSpace,
  getSpaceAvailable,
} from 'services/web3/contracts/liquidityProtection/wrapper';
import { useCallback, useEffect, useState } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { useInterval } from 'hooks/useInterval';
import BigNumber from 'bignumber.js';

interface Props {
  pool: Pool;
  token: Token;
  selectedToken: Token;
}

export const AddLiquiditySingleSpaceAvailable = ({
  pool,
  token,
  selectedToken,
}: Props) => {
  const [showPriceDeviationWarning, setShowPriceDeviationWarning] =
    useState(false);
  const [spaceAvailableBnt, setSpaceAvailableBnt] = useState('');
  const [spaceAvailableTkn, setSpaceAvailableTkn] = useState('');
  const [bntNeeded, setBntNeeded] = useState('');

  useInterval(
    async () => {
      await fetchData();
    },
    15000,
    false
  );

  const fetchData = useCallback(async () => {
    try {
      const isPriceDeviationToHigh = await checkPriceDeviationTooHigh(
        pool,
        selectedToken
      );
      setShowPriceDeviationWarning(isPriceDeviationToHigh);
      if (isPriceDeviationToHigh) {
        return;
      }
      const spaceAvailable = await getSpaceAvailable(
        pool.pool_dlt_id,
        token.decimals
      );
      setSpaceAvailableBnt(spaceAvailable.bnt);
      setSpaceAvailableTkn(spaceAvailable.tkn);
      if (selectedToken.symbol !== 'BNT') {
        const isSpaceAvailable = new BigNumber(spaceAvailable.tkn).gt(1);
        if (!isSpaceAvailable) {
          const bntNeeded = await fetchBntNeededToOpenSpace(pool);
          setBntNeeded(bntNeeded);
        } else {
          setBntNeeded('');
        }
      }
    } catch (e) {
      console.error('failed to fetch space available with msg: ', e.message);
    }
  }, [pool, token.decimals, selectedToken]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return (
    <div>
      {showPriceDeviationWarning ? (
        <div className="p-20 rounded bg-error font-medium my-20 text-white">
          Due to price volatility, protecting your tokens is currently not
          available. Please try again in a few minutes.
        </div>
      ) : (
        <div className="p-20 rounded bg-blue-0 dark:bg-blue-5 my-20">
          <div className="flex justify-between dark:text-grey-0">
            <span className="font-medium">Space Available</span>{' '}
            <div className="text-right">
              {selectedToken.symbol === 'BNT' ? (
                <div>{prettifyNumber(spaceAvailableBnt)} BNT</div>
              ) : (
                <div>
                  {prettifyNumber(spaceAvailableTkn)} {token && token.symbol}
                </div>
              )}
            </div>
          </div>
          {bntNeeded && (
            <div className="flex justify-between dark:text-grey-0">
              <span className="font-medium">BNT needed to open up space</span>{' '}
              <div className="text-right">
                <div>{prettifyNumber(bntNeeded)} BNT</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
