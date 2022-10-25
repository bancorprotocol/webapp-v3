import { Token } from 'services/observables/tokens';
import { Widget } from 'components/widgets/Widget';
import { AddLiquiditySingleInfoBox } from './AddLiquiditySingleInfoBox';
import { AddLiquiditySingleSelectPool } from './AddLiquiditySingleSelectPool';
import { AddLiquiditySingleSpaceAvailable } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleSpaceAvailable';
import { useAppSelector } from 'store';
import { AddLiquiditySingleAmount } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleAmount';
import { useCallback, useState } from 'react';
import { AddLiquiditySingleCTA } from 'elements/earn/pools/addLiquidity/single/AddLiquiditySingleCTA';
import { useDispatch } from 'react-redux';
import { prettifyNumber } from 'utils/helperFunctions';
import BigNumber from 'bignumber.js';
import { getTokenV2ById } from 'store/bancor/bancor';
import { addLiquidityV2Single } from 'services/web3/liquidity/liquidity';
import {
  addLiquiditySingleFailedNotification,
  addLiquiditySingleNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { ApprovalContract } from 'services/web3/approval';
import {
  sendLiquidityApprovedEvent,
  sendLiquidityEvent,
  sendLiquidityFailEvent,
  sendLiquiditySuccessEvent,
  setCurrentLiquidity,
} from 'services/api/googleTagManager/liquidity';
import { Pool } from 'services/observables/pools';
import { useNavigation } from 'hooks/useNavigation';
import { fetchProtectedPositions } from 'services/web3/protection/positions';
import { setProtectedPositions } from 'store/liquidity/liquidity';
import { Events } from 'services/api/googleTagManager';
import { useApproval } from 'hooks/useApproval';
import { TokenCurrency } from 'store/user/user';

interface Props {
  pool: Pool;
}

export const AddLiquiditySingle = ({ pool }: Props) => {
  const dispatch = useDispatch();
  const tkn = useAppSelector<Token | undefined>((state: any) =>
    getTokenV2ById(state, pool.reserves[0].address)
  );
  const bnt = useAppSelector<Token | undefined>((state: any) =>
    getTokenV2ById(state, pool.reserves[1].address)
  );
  const { goToPage } = useNavigation();

  const [isBNTSelected, setIsBNTSelected] = useState(false);
  const [amount, setAmount] = useState('');
  const [amountUsd, setAmountUsd] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [spaceAvailableBnt, setSpaceAvailableBnt] = useState('');
  const [spaceAvailableTkn, setSpaceAvailableTkn] = useState('');
  const tokenCurrency = useAppSelector((state) => state.user.tokenCurrency);
  const isCurrency = tokenCurrency === TokenCurrency.Currency;
  const pools = useAppSelector<Pool[]>((state) => state.pool.v2Pools);
  const account = useAppSelector((state) => state.user.account);

  const selectedToken = isBNTSelected ? bnt! : tkn!;
  const setSelectedToken = useCallback(
    (token: Token) => {
      const isBNT = token.address === bnt!.address;
      setIsBNTSelected(isBNT);
    },
    [bnt]
  );

  const handleAmountChange = (amount: string, tkn?: Token) => {
    setAmount(amount);
    const usdAmount = new BigNumber(amount)
      .times(tkn ? tkn.usdPrice! : selectedToken.usdPrice!)
      .toString();
    setAmountUsd(usdAmount);
  };

  const addV2Protection = async () => {
    const cleanAmount = prettifyNumber(amount);
    let transactionId: string;
    await addLiquidityV2Single(
      pool,
      selectedToken,
      amount,
      (txHash: string) => {
        transactionId = txHash;
        addLiquiditySingleNotification(
          dispatch,
          txHash,
          cleanAmount,
          selectedToken.symbol,
          pool.name
        );
      },
      async () => {
        sendLiquiditySuccessEvent(transactionId);
        const positions = await fetchProtectedPositions(pools, account!);
        dispatch(setProtectedPositions(positions));
        if (window.location.pathname.includes(pool.pool_dlt_id))
          goToPage.portfolioV2();
      },
      () => {
        sendLiquidityFailEvent('User rejected transaction');
        rejectNotification(dispatch);
      },
      (errorMsg) => {
        sendLiquidityFailEvent(errorMsg);
        addLiquiditySingleFailedNotification(
          dispatch,
          cleanAmount,
          selectedToken.symbol,
          pool.name
        );
      }
    );
  };

  const startApprove = useApproval(
    [{ amount, token: selectedToken }],
    addV2Protection,
    ApprovalContract.LiquidityProtection,
    sendLiquidityEvent,
    sendLiquidityApprovedEvent
  );

  const handleError = useCallback(() => {
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
  }, [
    amount,
    errorMsg,
    selectedToken.symbol,
    spaceAvailableBnt,
    spaceAvailableTkn,
  ]);

  const handleCTAClick = useCallback(() => {
    setCurrentLiquidity(
      'Deposit Single',
      pool.name,
      selectedToken.symbol,
      amount,
      amountUsd,
      undefined,
      undefined,
      isCurrency
    );
    sendLiquidityEvent(Events.click);
    startApprove();
  }, [
    startApprove,
    amount,
    amountUsd,
    isCurrency,
    pool.name,
    selectedToken.symbol,
  ]);

  if (!tkn) {
    goToPage.notFound();
    return <></>;
  }

  return (
    <Widget
      title="Add Liquidity"
      subtitle="Single-Sided"
      goBack={goToPage.earnV2}
    >
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
          setToken={setSelectedToken}
          errorMsg={errorMsg}
          isBNTSelected={isBNTSelected}
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
        onStart={handleCTAClick}
        amount={amount}
        errorMsg={handleError()}
        isBNTSelected={isBNTSelected}
      />
    </Widget>
  );
};
