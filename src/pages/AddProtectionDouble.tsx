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
import { currentNetwork$ } from 'services/observables/network';
import { prettifyNumber } from 'utils/helperFunctions';
import { BigNumber } from '@0x/utils';

export const AddProtectionDouble = (
  props: RouteComponentProps<{ anchor: string }>
) => {
  const { anchor } = props.match.params;

  const isValidAnchor = isAddress(anchor);

  const [amountBnt, setAmountBnt] = useState('');
  const [amountTkn, setAmountTkn] = useState('');
  const [amountUsd, setAmountUsd] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    loadSwapData(dispatch);
  }, [dispatch]);

  const isLoading = useAppSelector((state) => state.bancor.pools.length === 0);
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

  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [spaceAvailable, setAvailable] = useState({
    bntAvailable: '',
    tknAvailable: '',
  });

  const [bntToken, setBntToken] = useState<Token>();
  const [tknToken, setTknToken] = useState<Token>();

  useAsyncEffect(
    async (isMounted) => {
      if (!selectedPool) {
        return;
      }
      const reserveAddresses = selectedPool.reserves.map(
        (reserve) => reserve.address
      );
    },
    [selectedPool]
  );

  if (!isValidAnchor) return <div>Invalid Anchor!</div>;

  const addLiquidity = async (skipApproval: boolean) => {};

  if (
    isLoading ||
    typeof selectedPool === 'undefined' ||
    !tokens ||
    tokens.length === 0
  ) {
    return <div>Loading...</div>;
  }
  const listPool = createListPool(selectedPool!, tokens);

  return (
    (
      <div className="widget">
        <ModalApprove
          isOpen={showModal}
          setIsOpen={setShowModal}
          amount={'amount'}
          fromToken={selectedToken!}
          handleApproved={() => addLiquidity(true)}
          waitForApproval={true}
        />
        <div className="flex justify-between p-14">
          <SwapSwitch />
          <div className="text-center">
            <h1 className="font-bold">Add Liquidity </h1>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-10 px-5 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <IconTimes className="w-14" />
          </button>
        </div>

        <div className="px-10">
          <div>Please enter the token prices</div>
          <div className="flex justify-between">
            <div>
              <h2>1 BNT = </h2>
              <input className="border border-blue-light p-10" type="text" />
            </div>
            <div>
              <h2>1 ETH = </h2>
              <input className="border border-blue-light p-10" type="text" />
            </div>
          </div>
          <div>1 BNT ($0.00) = 0.00 ETH ($0.00)</div>

          <div className="rounded-lg bg-blue-0 rounded p-20">
            <div className="flex justify-start">
              <div className="text-grey-3 mr-4 rounded-full bg-white w-32 h-32">
                2
              </div>
              <div className="text-grey-3">Enter stake amount</div>
            </div>{' '}
            <TokenInputField
              setInput={setAmountBnt}
              selectable={false}
              input={amountBnt}
              label="Stake Amount"
              token={selectedToken!}
              amountUsd={amountUsd}
              setAmountUsd={setAmountUsd}
              setToken={(token) => setToken(token)}
            />
            <TokenInputField
              setInput={setAmountTkn}
              selectable={false}
              input={amountTkn}
              label="Stake Amount"
              token={selectedToken!}
              amountUsd={amountUsd}
              setAmountUsd={setAmountUsd}
              setToken={(token) => setToken(token)}
            />
            <div>
              <span>
                I understand that I am adding dual sided liquidity to the pool
              </span>
            </div>
            <button
              onClick={() => {
                addProtection();
              }}
              className={`rounded w-full`}
              disabled={false}
            >
              {'Add Protection'}
            </button>
          </div>
        </div>
      </div>
    ) || <div>Invalid anchor!</div>
  );
};
