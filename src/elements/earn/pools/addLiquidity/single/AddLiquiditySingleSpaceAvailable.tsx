import { Token } from 'services/observables/tokens';
import { useCallback, useEffect, useState } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
import { useInterval } from 'hooks/useInterval';
import BigNumber from 'bignumber.js';
import { ReactComponent as IconBell } from 'assets/icons/bell.svg';
import { useAppSelector } from 'store';
import { getTokenV2ById } from 'store/bancor/bancor';
import {
  checkPriceDeviationTooHigh,
  fetchBntNeededToOpenSpace,
  getSpaceAvailable,
} from 'services/web3/liquidity/liquidity';
import { Pool } from 'services/observables/pools';
import { PopoverV3 } from 'components/popover/PopoverV3';

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
  const bnt = useAppSelector<Token | undefined>((state: any) =>
    getTokenV2ById(state, pool.reserves[1].address)
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
        <div className="p-20 my-20 font-medium text-white rounded bg-error">
          Due to price volatility, protecting your tokens is currently not
          available. Please try again in a few minutes.
        </div>
      ) : (
        <div className="p-20 my-20 rounded bg-fog dark:bg-black-disabled">
          <div className="flex justify-between dark:text-white">
            <span className="font-medium">Space Available</span>{' '}
            <div className="text-right">
              {selectedToken.symbol === 'BNT' ? (
                <button onClick={() => setAmount(spaceAvailableBnt)}>
                  {prettifyNumber(spaceAvailableBnt)} BNT
                </button>
              ) : (
                <div className="flex items-center space-x-5">
                  <button onClick={() => setAmount(spaceAvailableTkn)}>
                    {prettifyNumber(spaceAvailableTkn)} {token && token.symbol}
                  </button>
                  {new BigNumber(spaceAvailableTkn).lte(1) && (
                    <PopoverV3
                      children="Notify me when space opens up"
                      hover
                      buttonElement={() => (
                        <a
                          href={`https://9000.hal.xyz/recipes/bancor-pool-liquidity-protocol?pool=${pool.pool_dlt_id}&token=${token.symbol}&value=10000&currency=USD`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <IconBell className="w-12" />
                        </a>
                      )}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          {bntNeeded && (
            <div className="flex justify-between dark:text-white">
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
