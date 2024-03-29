import { Token } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { AddLiquidityEmptyStep1 } from 'elements/earn/pools/addLiquidity/empty/AddLiquidityEmptyStep1';
import { useEffect, useState } from 'react';
import { AddLiquidityEmptyStep2 } from 'elements/earn/pools/addLiquidity/empty/AddLiquidityEmptyStep2';
import { useAppSelector } from 'store';
import { getTokenV2ById } from 'store/bancor/bancor';
import BigNumber from 'bignumber.js';

import { AddLiquidityEmptyCTA } from 'elements/earn/pools/addLiquidity/empty/AddLiquidityEmptyCTA';
import { Pool } from 'services/observables/pools';
import { useNavigation } from 'hooks/useNavigation';

interface Props {
  pool: Pool;
}

export const AddLiquidityEmpty = ({ pool }: Props) => {
  const [tknReserve, bntReserve] = pool.reserves;
  const tkn = useAppSelector<Token | undefined>((state: any) =>
    getTokenV2ById(state, tknReserve.address)
  );
  const bnt = useAppSelector<Token | undefined>((state: any) =>
    getTokenV2ById(state, bntReserve.address)
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

  const { goToPage } = useNavigation();

  if (!tkn || !bnt) {
    goToPage.notFound();
    return <></>;
  }

  const bntTknRate = () => {
    return new BigNumber(bnt.usdPrice!).div(tknUsdPrice).toString();
  };
  return (
    <Widget title="Add Liquidity" goBack={goToPage.earnV2}>
      <AddLiquidityEmptyStep1
        tkn={tkn}
        bnt={bnt}
        tknUsdPrice={tknUsdPrice}
        setTknUsdPrice={setTknUsdPrice}
        bntTknRate={bntTknRate()}
      />
      <div className="p-10 rounded bg-secondary mt-20">
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
