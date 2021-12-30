import { Pool, Token } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { AddLiquidityDualStakeAmount } from 'elements/earn/pools/addLiquidity/dual/AddLiquidityDualStakeAmount';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import { useState } from 'react';

import { AddLiquidityEmptyCTA } from 'elements/earn/pools/addLiquidity/empty/AddLiquidityEmptyCTA';
import { AddLiquidityDualTokenPrices } from 'elements/earn/pools/addLiquidity/dual/AddLiquidityDualTokenPrices';
import BigNumber from 'bignumber.js';
import { useNavigation } from 'services/router';

interface Props {
  pool: Pool;
  reserveBalances: { tknBalance: string; bntBalance: string };
}

export const AddLiquidityDual = ({ pool, reserveBalances }: Props) => {
  const [tknReserve, bntReserve] = pool.reserves;
  const tkn = useAppSelector<Token | undefined>(
    getTokenById(tknReserve.address)
  );
  const bnt = useAppSelector<Token | undefined>(
    getTokenById(bntReserve.address)
  );
  const { pushLiquidityError, pushPools } = useNavigation();
  const [tknAmount, setTknAmount] = useState('');
  const [bntAmount, setBntAmount] = useState('');
  const [errorBalanceBnt, setErrorBalanceBnt] = useState('');
  const [errorBalanceTkn, setErrorBalanceTkn] = useState('');

  const bntTknRate = () => {
    const rate = new BigNumber(reserveBalances.tknBalance).div(
      reserveBalances.bntBalance
    );
    return rate.toString();
  };

  const tknWithUsd = (): Token => {
    const tknWithUsd = { ...tkn };
    if (bnt && tknWithUsd && new BigNumber(tknWithUsd.usdPrice ?? 0).eq(0)) {
      tknWithUsd.usdPrice = new BigNumber(bntTknRate())
        .div(bnt.usdPrice!)
        .toString();
    }
    return tknWithUsd as Token;
  };

  if (!tkn || !bnt) {
    pushLiquidityError();
    return <></>;
  }

  return (
    <Widget title="Add Liquidity" goBack={pushPools}>
      <AddLiquidityDualStakeAmount
        tkn={tknWithUsd()}
        bnt={bnt}
        tknAmount={tknAmount}
        setTknAmount={setTknAmount}
        bntAmount={bntAmount}
        setBntAmount={setBntAmount}
        bntTknRate={bntTknRate()}
        errorBalanceBnt={errorBalanceBnt}
        setErrorBalanceBnt={setErrorBalanceBnt}
        errorBalanceTkn={errorBalanceTkn}
        setErrorBalanceTkn={setErrorBalanceTkn}
      />
      <div className="p-10 rounded bg-blue-0 dark:bg-blue-5 mt-20">
        <AddLiquidityDualTokenPrices
          bnt={bnt}
          tkn={tknWithUsd()}
          bntTknRate={bntTknRate()}
        />
        <AddLiquidityEmptyCTA
          pool={pool}
          bnt={bnt}
          tkn={tknWithUsd()}
          amountBnt={bntAmount}
          amountTkn={tknAmount}
          errorMsg={
            errorBalanceTkn || errorBalanceBnt ? 'Insufficient Balance' : ''
          }
        />
      </div>
    </Widget>
  );
};
