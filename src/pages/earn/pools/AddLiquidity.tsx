import { getPoolById, SelectedPool } from 'store/bancor/pool';
import { AddLiquiditySingle } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingle';
import { AddLiquidityDual } from 'elements/earn/pools/addLiquidity/dual/AddLiquidityDual';
import { AddLiquidityEmpty } from 'elements/earn/pools/addLiquidity/empty/AddLiquidityEmpty';
import { useAppSelector } from 'store';
import React, { useCallback, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import { WidgetLoading } from 'components/widgets/WidgetLoading';
import { WidgetError } from 'components/widgets/WidgetError';
import { fetchReserveBalances } from 'services/web3/liquidity/liquidity';
import { useParams } from 'react-router-dom';

export const AddLiquidity = React.memo(() => {
  const { id } = useParams();
  const { status, pool } = useAppSelector<SelectedPool>(getPoolById(id || ''));
  const [isCheckingType, setIsCheckingType] = useState(false);
  const [type, setType] = useState('');
  const [reserveBalances, setReserveBalances] = useState({
    tknBalance: '0',
    bntBalance: '0',
  });

  const checkType = useCallback(async () => {
    if (!pool) {
      return;
    }
    setIsCheckingType(true);
    if (pool.isProtected) {
      setType('single');
    } else {
      const { tknBalance, bntBalance } = await fetchReserveBalances(pool);
      setReserveBalances({ tknBalance, bntBalance });
      const isPoolEmpty = [tknBalance, bntBalance].some((b) =>
        new BigNumber(b).eq(0)
      );

      if (isPoolEmpty) {
        setType('empty');
      } else {
        setType('dual');
      }
    }
    setIsCheckingType(false);
  }, [pool]);

  useEffect(() => {
    void checkType();
  }, [id, checkType]);

  const isLoading = () => {
    return status === 'loading' || isCheckingType;
  };

  return (
    <div className="pt-40 md:pt-[100px]">
      {isLoading() ? (
        <WidgetLoading title="Add Liquidity" />
      ) : (
        <div>
          {!pool ? (
            <WidgetError title="Add Liquidity" />
          ) : (
            <div>
              {type === 'single' && <AddLiquiditySingle pool={pool} />}
              {type === 'dual' && (
                <AddLiquidityDual
                  pool={pool}
                  reserveBalances={reserveBalances}
                />
              )}
              {type === 'empty' && <AddLiquidityEmpty pool={pool} />}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
