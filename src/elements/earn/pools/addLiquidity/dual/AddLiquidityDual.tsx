import { Pool, Token } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { AddLiquidityDualStakeAmount } from 'elements/earn/pools/addLiquidity/dual/AddLiquidityDualStakeAmount';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { AddLiquidityEmptyCTA } from 'elements/earn/pools/addLiquidity/empty/AddLiquidityEmptyCTA';
import { AddLiquidityDualTokenPrices } from 'elements/earn/pools/addLiquidity/dual/AddLiquidityDualTokenPrices';
import BigNumber from 'bignumber.js';

interface Props {
  pool: Pool;
}

export const AddLiquidityDual = ({ pool }: Props) => {
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

  const history = useHistory();
  if (!tkn || !bnt) {
    history.push('/pools/add-liquidity/error');
    return <></>;
  }

  const bntTknRate = () => {
    return new BigNumber(bnt.usdPrice!).div(tkn.usdPrice!).toString();
  };

  return (
    <Widget title="Add Liquidity">
      <AddLiquidityDualStakeAmount
        tkn={tkn}
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
          tkn={tkn}
          bntTknRate={bntTknRate()}
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
