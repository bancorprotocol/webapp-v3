import { Pool, Token } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { AddLiquidityEmptyStep1 } from 'elements/earn/pools/addLiquidity/empty/AddLiquidityEmptyStep1';
import { useEffect, useState } from 'react';
import { AddLiquidityEmptyStep2 } from 'elements/earn/pools/addLiquidity/empty/AddLiquidityEmptyStep2';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import BigNumber from 'bignumber.js';

import { AddLiquidityEmptyCTA } from 'elements/earn/pools/addLiquidity/empty/AddLiquidityEmptyCTA';
import { useNavigation } from 'services/router';

interface Props {
  pool: Pool;
}

export const AddLiquidityEmpty = ({ pool }: Props) => {
  const [tknReserve, bntReserve] = pool.reserves;
  const tkn = useAppSelector<Token | undefined>(
    getTokenById(tknReserve.address)
  );
  const bnt = useAppSelector<Token | undefined>(
    getTokenById(bntReserve.address)
  );
  const [tknAmount, setTknAmount] = useState('');
  const [bntAmount, setBntAmount] = useState('');
  const [errorBalanceBnt, setErrorBalanceBnt] = useState('');
  const [errorBalanceTkn, setErrorBalanceTkn] = useState('');
  const [tknUsdPrice, setTknUsdPrice] = useState('');
  useEffect(() => {
    setBntAmount('');
    setTknAmount('');
  }, [tknUsdPrice]);

  const { pushLiquidityError, pushPools } = useNavigation();
  if (!tkn || !bnt) {
    pushLiquidityError();
    return <></>;
  }

  const bntTknRate = () => {
    return new BigNumber(bnt.usdPrice!).div(tknUsdPrice).toString();
  };
  return (
    <Widget title="Add Liquidity" goBack={pushPools}>
      <AddLiquidityEmptyStep1
        tkn={tkn}
        bnt={bnt}
        tknUsdPrice={tknUsdPrice}
        setTknUsdPrice={setTknUsdPrice}
        bntTknRate={bntTknRate()}
      />
      <div className="p-10 rounded bg-blue-0 dark:bg-blue-5 mt-20">
        <AddLiquidityEmptyStep2
          tkn={tkn}
          bnt={bnt}
          tknAmount={tknAmount}
          setTknAmount={setTknAmount}
          bntAmount={bntAmount}
          setBntAmount={setBntAmount}
          bntTknRate={bntTknRate()}
          tknUsdPrice={tknUsdPrice}
          errorBalanceBnt={errorBalanceBnt}
          setErrorBalanceBnt={setErrorBalanceBnt}
          errorBalanceTkn={errorBalanceTkn}
          setErrorBalanceTkn={setErrorBalanceTkn}
        />
        <AddLiquidityEmptyCTA
          pool={pool}
          bnt={bnt}
          tkn={tkn}
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
