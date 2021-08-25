import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { ModalApprove } from 'elements/modalApprove/modalApprove';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { useAppSelector } from 'redux/index';
import {
  addNotification,
  NotificationType,
} from 'redux/notification/notification';
import { Pool } from 'services/api/bancor';
import { Token } from 'services/observables/tokens';
import { loadSwapData } from 'services/observables/triggers';
import { getNetworkContractApproval } from 'services/web3/approval';
import { isAddress } from 'web3-utils';
import { openWalletModal } from 'redux/user/user';
import {
  bntTokenAddress$,
  govTokenAddress$,
  liquidityProtection$,
} from 'services/observables/contracts';
import { first } from 'rxjs/operators';
import { expandToken, shrinkToken } from 'utils/pureFunctions';
import { bntToken, ethToken } from 'services/web3/config';
import { createListPool } from 'utils/pureFunctions';
import {
  addLiquidity,
  getMaxStakes,
} from 'services/web3/contracts/liquidityProtection/wrapper';
import { onLogin$ } from 'services/observables/user';
import { SearchablePoolList } from 'components/searchablePoolList/SearchablePoolList';
import { useAsyncEffect } from 'use-async-effect';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { Image } from 'components/image/Image';
import { currentNetwork$ } from 'services/observables/network';
import { prettifyNumber } from 'utils/helperFunctions';
import { BigNumber } from '@0x/utils';

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
                setInput={setAmountBnt}
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
              setInput={setAmountTkn}
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
                <div className="text-grey-4 text-right">~$4.22</div>
              </div>
              <div className="flex justify-between">
                <div className="text-20">1 ETH =</div>
                <div className="text-grey-4 text-right">~$3200.17</div>
              </div>
            </div>
            <div className="flex pt-4 justify-between">
              <div>1 BNT ($0.00) =</div>
              <div>0.00 ETH ($0.00)</div>
            </div>
            <div className="text-14 mt-12 mb-20 leading-3">
              I understand that I am adding dual sided liquidity to the pool
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
