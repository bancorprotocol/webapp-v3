import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { ModalApprove } from 'elements/modalApprove/modalApprove';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { useAppSelector } from 'redux/index';
import { Pool } from 'services/api/bancor';
import { Token } from 'services/observables/tokens';
import { loadSwapData } from 'services/observables/triggers';
import { isAddress } from 'web3-utils';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { prettifyNumber } from 'utils/helperFunctions';
import {
  fetchPoolReserveBalances,
  getTokenContractApproval,
} from 'services/web3/contracts/converter/wrapper';
import { partitionPair } from 'utils/pureFunctions';
import { BigNumber } from 'bignumber.js';
import { useInterval } from 'hooks/useInterval';
import { getNetworkContractApproval } from 'services/web3/approval';
import { TokenAndAmount } from 'services/web3/types';
import {
  addNotification,
  NotificationType,
} from 'redux/notification/notification';
import { useApprove } from 'hooks/useApprove';

export const AddProtectionDoubleLiq = (
  props: RouteComponentProps<{ anchor: string }>
) => {
  const { anchor } = props.match.params;

  const isValidAnchor = isAddress(anchor);

  const [amountBnt, setAmountBnt] = useState('');
  const [amountTkn, setAmountTkn] = useState('');

  const [amountBntUsd, setAmountBntUsd] = useState('');
  const [amountTknUsd, setAmountTknUsd] = useState('');

  const pools = useAppSelector((state) => state.bancor.pools as Pool[]);
  const tokens = useAppSelector((state) => state.bancor.tokens as Token[]);
  const account = useAppSelector(
    (state) => state.bancor.user as string | undefined
  );

  const [selectedPool, setPool] = useState(
    pools.find(
      (pool) => pool.pool_dlt_id.toLowerCase() === anchor.toLowerCase()
    )
  );
  useEffect(() => {
    setPool(pools.find((pool) => pool.pool_dlt_id === anchor));
  }, [pools, anchor]);

  const bntToken =
    (tokens &&
      tokens.length > 0 &&
      tokens.find((token) => token.symbol === 'BNT')) ||
    false;

  const tknTokenAddress =
    bntToken &&
    selectedPool?.reserves.find(
      (reserve) => reserve.address !== bntToken.address
    )?.address;

  const tknToken =
    (bntToken &&
      tknTokenAddress &&
      tokens.find((token) => token.address === tknTokenAddress)) ||
    false;

  const dispatch = useDispatch();

  const [bntToTknRate, setBntToTknRate] = useState('');
  const [tknToBntRate, setTknToBntRate] = useState('');

  const onBntChange = (value: string) => {
    setAmountBnt(value);
    if (tknToken) {
      const amountTkn = new BigNumber(value).times(bntToTknRate);

      setAmountTkn(
        amountTkn.toFormat(tknToken.decimals, BigNumber.ROUND_UP, {
          groupSeparator: '',
          decimalSeparator: '.',
        })
      );
      setAmountTknUsd(amountTkn.times(tknToken.usdPrice!).toString());
    }
  };

  const onTknChange = (value: string) => {
    setAmountTkn(value);
    if (bntToken) {
      const amountBnt = new BigNumber(value).times(tknToBntRate);
      setAmountBnt(
        amountBnt.toFormat(bntToken.decimals, BigNumber.ROUND_UP, {
          groupSeparator: '',
          decimalSeparator: '.',
        })
      );
      setAmountBntUsd(amountBnt.times(bntToken.usdPrice!).toString());
    }
  };

  const fetchPoolRates = async () => {
    if (selectedPool && bntToken) {
      const poolBalances = await fetchPoolReserveBalances(selectedPool);
      const [bntReserve, tknReserve] = partitionPair(
        poolBalances,
        (balance) => balance.contract === bntToken.address
      ).map((reserve) => reserve.weiAmount);
      setBntToTknRate(new BigNumber(tknReserve).div(bntReserve).toString());
      setTknToBntRate(new BigNumber(bntReserve).div(tknReserve).toString());
    }
  };

  useEffect(() => {
    fetchPoolRates();
  }, [selectedPool]);

  useInterval(
    () => {
      fetchPoolRates();
    },
    60000,
    false
  );

  useEffect(() => {
    loadSwapData(dispatch);
  }, [dispatch]);

  const isLoading = useAppSelector((state) => state.bancor.pools.length === 0);

  useEffect(() => {
    setPool(pools.find((pool) => pool.pool_dlt_id === anchor));
  }, [pools, anchor]);

  const [
    triggerCheck,
    isOpen,
    selectedToken,
    selectedAmount,
    waitForConfirmation,
    handleApproved,
  ] = useApprove(
    [
      { amount: amountBnt, token: bntToken as Token },
      { amount: amountTkn, token: tknToken as Token },
    ],
    '0x1f573d6fb3f13d689ff844b4ce37794d79a7ff1c',
    true,
    () => console.log('approveeey')
  );

  if (!isValidAnchor) return <div>Invalid Anchor!</div>;

  const addLiquidity = async (skipApproval: boolean = false) => {
    if (!skipApproval) {
      console.log('triggering check');
      triggerCheck();
      return;
    }
    console.log('got to add liquidity');
  };

  if (
    isLoading ||
    typeof selectedPool === 'undefined' ||
    !tokens ||
    tokens.length === 0
  ) {
    return <div>Loading...</div>;
  }

  console.log({ isOpen }, 'derp');

  return (
    (
      <ModalApprove
        isOpen={false}
        setIsOpen={() => {}}
        amount={selectedAmount}
        fromToken={selectedToken}
        handleApproved={(address: string) => handleApproved(address)}
        waitForApproval={waitForConfirmation}
      />
    ) || <div>Invalid anchor!</div>
  );
};
