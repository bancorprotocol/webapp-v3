import { Pool, Token } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { AddLiquiditySingleInfoBox } from './AddLiquiditySingleInfoBox';
import { AddLiquiditySingleSelectPool } from './AddLiquiditySingleSelectPool';
import { AddLiquiditySingleSpaceAvailable } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleSpaceAvailable';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import { AddLiquiditySingleAmount } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleAmount';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useApproveModal } from 'hooks/useApproveModal';
import { addLiquiditySingle } from 'services/web3/contracts/liquidityProtection/wrapper';

interface Props {
  pool: Pool;
}

export const AddLiquiditySingle = ({ pool }: Props) => {
  const tkn = useAppSelector<Token | undefined>(
    getTokenById(pool.reserves[0].address)
  );
  const history = useHistory();
  const [selectedToken, setSelectedToken] = useState<Token>(tkn!);
  const [amount, setAmount] = useState('');

  const addProtection = async () => {
    const txHash = await addLiquiditySingle({
      pool,
      token: selectedToken,
      amount,
    });
  };

  const [onStart, ModalApprove] = useApproveModal(
    [{ amount, token: selectedToken }],
    addProtection,
    pool.converter_dlt_id
  );

  if (!tkn) {
    history.push('/pools/add-liquidity/error');
    return <></>;
  }

  return (
    <Widget title="Add Liquidity" subtitle="Single-Sided">
      <AddLiquiditySingleInfoBox />
      <div className="px-10">
        <AddLiquiditySingleSelectPool pool={pool} />
        <AddLiquiditySingleAmount
          pool={pool}
          amount={amount}
          setAmount={setAmount}
          token={selectedToken}
          setToken={(token: Token) => setSelectedToken(token)}
        />
      </div>
      <AddLiquiditySingleSpaceAvailable pool={pool} token={tkn} />
      <button onClick={() => onStart()} className="btn-primary rounded w-full">
        Stake and Protect
      </button>
      {ModalApprove}
    </Widget>
  );
};
