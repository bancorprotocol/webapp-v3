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
import { fetchPoolReserveBalances } from 'services/web3/contracts/converter/wrapper';
import { partitionPair } from 'utils/pureFunctions';
import { BigNumber } from 'bignumber.js';
import { useInterval } from 'hooks/useInterval';

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
    tokens &&
    tokens.length > 0 &&
    tokens.find((token) => token.symbol === 'BNT');
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

  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (!isValidAnchor) return <div>Invalid Anchor!</div>;

  const checkApproval = async () => {
    // try {
    //   const isApprovalReq = await getNetworkContractApproval(
    //     selectedToken!,
    //     amount
    //   );
    //   if (isApprovalReq) {
    //     setShowModal(true);
    //   } else await addProtection(true);
    // } catch (e) {
    //   dispatch(
    //     addNotification({
    //       type: NotificationType.error,
    //       title: 'Transaction Failed',
    //       msg: `${
    //         selectedToken!.symbol
    //       } approval had failed. Please try again or contact support.`,
    //     })
    //   );
    // }
  };

  const addLiquidity = async (approvalRequired: boolean = false) => {};

  if (
    isLoading ||
    typeof selectedPool === 'undefined' ||
    !tokens ||
    tokens.length === 0
  ) {
    return <div>Loading...</div>;
  }

  console.log({ amountBnt, amountBntUsd }, 'derp');

  return (
    (
      <div className="widget">
        <ModalApprove
          isOpen={showModal}
          setIsOpen={setShowModal}
          amount={'amount'}
          fromToken={tknToken! as Token}
          handleApproved={() => addLiquidity(true)}
          waitForApproval={true}
        />
        <div className="flex justify-between p-14">
          <SwapSwitch />
          <div className="text-center">
            <h1 className="font-bold">Add Liquidity</h1>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="rounded-10 px-5 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <IconTimes className="w-14" />
          </button>
        </div>
        <hr className="widget-separator" />

        <div className="px-20 font-medium text-blue-4 mb-10 mt-6">
          Enter Stake Amount
        </div>

        <div className="px-10">
          <div className="px-4">
            <div className="mb-12">
              <TokenInputField
                label=" "
                setInput={onBntChange}
                selectable={false}
                input={amountBnt}
                token={bntToken! as Token}
                border
                amountUsd={amountBntUsd}
                setAmountUsd={setAmountBntUsd}
              />
            </div>

            <TokenInputField
              label=" "
              setInput={onTknChange}
              selectable={false}
              input={amountTkn}
              border
              token={tknToken! as Token}
              amountUsd={amountTknUsd}
              setAmountUsd={setAmountTknUsd}
            />
          </div>

          <div className="rounded rounded-lg leading-7 text-16 mb-10 mt-12 bg-blue-0 dark:bg-blue-5 dark:text-grey-0 text-blue-4 px-20 py-18">
            <div className="font-medium">Token prices</div>
            <div className="p-10 mt-8">
              <div className="flex justify-between">
                <div className="text-20">1 BNT =</div>
                <div className="text-grey-4 text-right">
                  ~
                  {bntToken &&
                    bntToken.usdPrice &&
                    prettifyNumber(bntToken.usdPrice, true)}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="text-20">1 {tknToken && tknToken.symbol} =</div>
                <div className="text-grey-4 text-right">
                  ~
                  {tknToken &&
                    tknToken.usdPrice &&
                    prettifyNumber(tknToken.usdPrice, true)}
                </div>
              </div>
            </div>
            <div className="flex pt-4 justify-between">
              <div>
                1 BNT (
                {bntToken &&
                  bntToken.usdPrice &&
                  prettifyNumber(bntToken.usdPrice, true)}
                ) =
              </div>
              <div>0.00 ETH ($0.00)</div>
            </div>
            <div className="text-14 mt-12 mb-20 leading-3">
              I understand that I am adding dual sided liquidity to the pool{' '}
            </div>
            <button
              onClick={() => {
                addLiquidity();
              }}
              className={`btn-primary rounded w-full`}
              disabled={false}
            >
              Supply
            </button>
          </div>
        </div>
      </div>
    ) || <div>Invalid anchor!</div>
  );
};
