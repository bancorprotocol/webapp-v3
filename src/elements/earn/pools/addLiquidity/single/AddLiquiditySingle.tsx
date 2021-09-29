import { Pool, Token } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { AddLiquiditySingleInfoBox } from './AddLiquiditySingleInfoBox';
import { AddLiquiditySingleSelectPool } from './AddLiquiditySingleSelectPool';
import { AddLiquiditySingleSpaceAvailable } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleSpaceAvailable';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import { AddLiquiditySingleAmount } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleAmount';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useApproveModal } from 'hooks/useApproveModal';
import { addLiquiditySingle } from 'services/web3/contracts/liquidityProtection/wrapper';
import { AddLiquiditySingleCTA } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleCTA';
import { useDispatch } from 'react-redux';
import {
  addNotification,
  NotificationType,
} from 'redux/notification/notification';
import { prettifyNumber } from 'utils/helperFunctions';
import { ErrorCode } from 'services/web3/types';

interface Props {
  pool: Pool;
}

export const AddLiquiditySingle = ({ pool }: Props) => {
  const dispatch = useDispatch();
  const tkn = useAppSelector<Token | undefined>(
    getTokenById(pool.reserves[0].address)
  );
  const history = useHistory();
  const [selectedToken, setSelectedToken] = useState<Token>(tkn!);
  const [amount, setAmount] = useState('');

  const addProtection = async () => {
    try {
      const txHash = await addLiquiditySingle({
        pool,
        token: selectedToken,
        amount,
      });
      dispatch(
        addNotification({
          type: NotificationType.pending,
          title: 'Add Protection',
          msg: `You staked ${prettifyNumber(amount)} ${
            selectedToken.symbol
          } for protection in pool ${pool.name}`,
          txHash,
        })
      );
    } catch (e) {
      if (e.code === ErrorCode.DeniedTx) {
        dispatch(
          addNotification({
            type: NotificationType.error,
            title: 'Transaction Rejected',
            msg: 'You rejected the transaction. If this was by mistake, please try again.',
          })
        );
      } else {
        dispatch(
          addNotification({
            type: NotificationType.error,
            title: 'Transaction Failed',
            msg: `Staking ${prettifyNumber(amount)} ${
              selectedToken.symbol
            } for protection in pool ${
              pool.name
            } failed. Please try again or contact support.`,
          })
        );
      }
    }
  };

  useEffect(() => {
    setSelectedToken(tkn!);
  }, [tkn]);

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
      <AddLiquiditySingleCTA onStart={onStart} amount={amount} />
      {ModalApprove}
    </Widget>
  );
};
