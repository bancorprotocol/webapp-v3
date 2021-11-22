import { Pool, Token } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { AddLiquiditySingleInfoBox } from './AddLiquiditySingleInfoBox';
import { AddLiquiditySingleSelectPool } from './AddLiquiditySingleSelectPool';
import { AddLiquiditySingleSpaceAvailable } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleSpaceAvailable';
import { useAppSelector } from 'redux/index';
import { AddLiquiditySingleAmount } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleAmount';
import { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useApproveModal } from 'hooks/useApproveModal';
import { AddLiquiditySingleCTA } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleCTA';
import { useDispatch } from 'react-redux';
import {
  addNotification,
  NotificationType,
} from 'redux/notification/notification';
import { prettifyNumber } from 'utils/helperFunctions';
import { ErrorCode } from 'services/web3/types';
import BigNumber from 'bignumber.js';
import { getTokenById } from 'redux/bancor/bancor';
import { addLiquiditySingle } from 'services/web3/liquidity/liquidity';
import { useAsyncEffect } from 'use-async-effect';
import { take } from 'rxjs/operators';
import { liquidityProtection$ } from 'services/observables/contracts';

interface Props {
  pool: Pool;
}

export const AddLiquiditySingle = ({ pool }: Props) => {
  const dispatch = useDispatch();
  const tkn = useAppSelector<Token | undefined>(
    getTokenById(pool.reserves[0].address)
  );
  const history = useHistory();
  const approveContract = useRef('');
  const [selectedToken, setSelectedToken] = useState<Token>(tkn!);
  const [amount, setAmount] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [spaceAvailableBnt, setSpaceAvailableBnt] = useState('');
  const [spaceAvailableTkn, setSpaceAvailableTkn] = useState('');

  const handleAmountChange = (amount: string, tkn?: Token) => {
    setAmount(amount);
    const usdAmount = new BigNumber(amount)
      .times(tkn ? tkn.usdPrice! : selectedToken.usdPrice!)
      .toString();
    setAmountUsd(usdAmount);
  };

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

  useAsyncEffect(async (isMounted) => {
    if (isMounted())
      approveContract.current = await liquidityProtection$
        .pipe(take(1))
        .toPromise();
  }, []);

  useEffect(() => {
    setSelectedToken(tkn!);
  }, [tkn]);

  const [onStart, ModalApprove] = useApproveModal(
    [{ amount, token: selectedToken }],
    addProtection,
    approveContract.current
  );

  if (!tkn) {
    history.push('/pools/add-liquidity/error');
    return <></>;
  }

  const handleError = () => {
    if (errorMsg) return errorMsg;
    if (!spaceAvailableBnt || !spaceAvailableTkn) {
      return '';
    }
    if (selectedToken.symbol === 'BNT') {
      const isSpaceAvailable = new BigNumber(spaceAvailableBnt).gte(
        amount || 0
      );
      if (isSpaceAvailable) {
        return '';
      } else {
        return 'Not enough space available';
      }
    } else {
      const isSpaceAvailable = new BigNumber(spaceAvailableTkn).gte(
        amount || 0
      );
      if (isSpaceAvailable) {
        return '';
      } else {
        return 'Not enough space available';
      }
    }
  };

  return (
    <Widget title="Add Liquidity" subtitle="Single-Sided">
      <AddLiquiditySingleInfoBox />
      <div className="px-10">
        <AddLiquiditySingleSelectPool pool={pool} />
        <AddLiquiditySingleAmount
          pool={pool}
          amount={amount}
          setAmount={setAmount}
          amountUsd={amountUsd}
          setAmountUsd={setAmountUsd}
          token={selectedToken}
          setToken={(token: Token) => setSelectedToken(token)}
          errorMsg={errorMsg}
          setErrorMsg={setErrorMsg}
        />
      </div>
      <AddLiquiditySingleSpaceAvailable
        pool={pool}
        token={tkn}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
        setAmount={handleAmountChange}
        spaceAvailableBnt={spaceAvailableBnt}
        setSpaceAvailableBnt={setSpaceAvailableBnt}
        spaceAvailableTkn={spaceAvailableTkn}
        setSpaceAvailableTkn={setSpaceAvailableTkn}
      />
      <AddLiquiditySingleCTA
        onStart={onStart}
        amount={amount}
        errorMsg={handleError()}
      />
      {ModalApprove}
    </Widget>
  );
};
