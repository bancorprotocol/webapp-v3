import { Pool, Token } from 'services/observables/tokens';
import { useCallback, useEffect, useState } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { useInterval } from 'hooks/useInterval';
import BigNumber from 'bignumber.js';
import { Tooltip } from 'components/tooltip/Tooltip';
import { ReactComponent as IconBell } from 'assets/icons/bell.svg';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import {
  checkPriceDeviationTooHigh,
  fetchBntNeededToOpenSpace,
  getSpaceAvailable,
} from 'services/web3/liquidity/liquidity';

interface Props {
  pool: Pool;
  token: Token;
  selectedToken: Token;
  setSelectedToken: Function;
  setAmount: Function;
  spaceAvailableBnt: string;
  setSpaceAvailableBnt: Function;
  spaceAvailableTkn: string;
  setSpaceAvailableTkn: Function;
}

export const AddLiquiditySingleSpaceAvailable = ({
  pool,
  token,
  selectedToken,
  setSelectedToken,
  setAmount,
  spaceAvailableBnt,
  setSpaceAvailableBnt,
  spaceAvailableTkn,
  setSpaceAvailableTkn,
}: Props) => {
  const bnt = useAppSelector<Token | undefined>(
    getTokenById(pool.reserves[1].address)
  );
  const [showPriceDeviationWarning, setShowPriceDeviationWarning] =
    useState(false);
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
    } catch (e: any) {
      console.error('failed to fetch space available with msg: ', e.message);
    }
  }, [
    pool,
    token.decimals,
    selectedToken,
    setSpaceAvailableBnt,
    setSpaceAvailableTkn,
  ]);

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
                <button onClick={() => setAmount(spaceAvailableBnt)}>
                  {prettifyNumber(spaceAvailableBnt)} BNT
                </button>
              ) : (
                <div>
                  <button
                    onClick={() => setAmount(spaceAvailableTkn)}
                    className="mr-4"
                  >
                    {prettifyNumber(spaceAvailableTkn)} {token && token.symbol}
                  </button>
                  {new BigNumber(spaceAvailableTkn).lte(1) && (
                    <Tooltip
                      content="Notify me when space opens up"
                      button={
                        <a
                          href={`https://9000.hal.xyz/recipes/bancor-pool-liquidity-protocol?pool=${pool.pool_dlt_id}&token=${token.symbol}&value=10000&currency=USD`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <IconBell className="w-12" />
                        </a>
                      }
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          {bntNeeded && (
            <div className="flex justify-between dark:text-grey-0">
              <span className="font-medium">BNT needed to open up space</span>{' '}
              <div className="text-right">
                <button
                  onClick={() => {
                    setSelectedToken(bnt);
                    setAmount(bntNeeded, bnt);
                  }}
                >
                  {prettifyNumber(bntNeeded)} BNT
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
