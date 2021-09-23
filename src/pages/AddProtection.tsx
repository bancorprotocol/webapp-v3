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
import { Pool, Token } from 'services/observables/tokens';
import { getNetworkContractApproval } from 'services/web3/approval';
import { isAddress } from 'web3-utils';
import { openWalletModal } from 'redux/user/user';
import {
  bntTokenAddress$,
  govTokenAddress$,
  liquidityProtection$,
} from 'services/observables/contracts';
import { first } from 'rxjs/operators';
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
import { expandToken, shrinkToken } from 'utils/formulas';
import { useWeb3React } from '@web3-react/core';

export const AddProtection = (
  props: RouteComponentProps<{ anchor: string }>
) => {
  const { anchor } = props.match.params;

  const isValidAnchor = isAddress(anchor);

  const buttonVariant = () => {
    const isHighSlippage = false;
    if (isHighSlippage) return 'btn-error';
    return 'btn-primary';
  };

  const [amount, setAmount] = useState('');
  const [amountUsd, setAmountUsd] = useState('');

  const dispatch = useDispatch();

  const isLoading = useAppSelector((state) => state.bancor.pools.length === 0);

  const [bntLimitIsReached, setBntLimitIsReached] = useState(false);
  const pools = useAppSelector((state) => state.bancor.pools as Pool[]);
  const tokens = useAppSelector((state) => state.bancor.tokens as Token[]);
  const { account } = useWeb3React();


  const [selectedPool, setPool] = useState(
    pools.find(
      (pool) => pool.pool_dlt_id.toLowerCase() === anchor.toLowerCase()
    )
  );

  useEffect(() => {
    setPool(pools.find((pool) => pool.pool_dlt_id === anchor));
  }, [pools, anchor]);

  const [selectedToken, setToken] = useState<Token | undefined>(
    tokens.find((token) => token.address === selectedPool?.reserves[0].address)
  );

  useEffect(() => {
    if (selectedToken) {
      setAmountUsd(
        new BigNumber(selectedToken.usdPrice || 0).times(amount).toString()
      );
    }
  }, [selectedToken, selectedPool, amount]);

  const [tknIsSelected, setTknIsSelected] = useState(false);

  useEffect(() => {
    const isBnt = selectedToken?.symbol === 'BNT';
    const bntTokenAddress = tokens.find(
      (token) => token.symbol === 'BNT'
    )?.address;
    setTknIsSelected(!isBnt);
    if (!isBnt) {
      const tknReserve = selectedPool?.reserves.find(
        (reserve) => reserve.address !== bntTokenAddress
      );
      setToken(tokens.find((token) => token.address === tknReserve?.address));
    }
  }, [selectedPool, selectedToken, tokens]);

  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [spaceAvailable, setAvailable] = useState({
    bntAvailable: '',
    tknAvailable: '',
  });
  const [spaceAvailableLabel, setSpaceAvailableLabel] = useState('');
  const [spaceIsLoading, setSpaceIsLoading] = useState(true);

  useAsyncEffect(async () => {
    const address = bntToken(await currentNetwork$.pipe(first()).toPromise());
    setTknIsSelected(address !== selectedToken?.address);
  }, [selectedToken]);

  useEffect(() => {
    setSpaceAvailableLabel(
      tknIsSelected ? spaceAvailable.tknAvailable : spaceAvailable.bntAvailable
    );
  }, [spaceAvailable, selectedToken, tknIsSelected]);

  useAsyncEffect(
    async (isMounted) => {
      if (!selectedPool) {
        return;
      }
      setSpaceIsLoading(true);
      const liquidityProtection = await liquidityProtection$
        .pipe(first())
        .toPromise();
      const { maxAllowedBntWei, maxAllowedTknWei } = await getMaxStakes(
        liquidityProtection,
        selectedPool!.pool_dlt_id
      );

      const currentNetwork = await currentNetwork$.pipe(first()).toPromise();
      const bntTokenAddress = bntToken(currentNetwork);
      const tknReserve = selectedPool.reserves.find(
        (reserve) => reserve.address !== bntTokenAddress
      )!;
      const tknToken = tokens.find(
        (token) => token.address === tknReserve.address
      )!;

      if (isMounted()) {
        const data = {
          bntAvailable: `${prettifyNumber(
            shrinkToken(maxAllowedBntWei, 18)
          )} BNT`,
          tknAvailable: `${prettifyNumber(
            shrinkToken(maxAllowedTknWei, tknToken.decimals)
          )} ${tknToken.symbol}`,
        };
        setAvailable(data);
        setSpaceIsLoading(false);
      }
    },
    [selectedPool]
  );

  if (!isValidAnchor) return <div>Invalid Anchor!</div>;

  const checkApproval = async () => {
    try {
      const isApprovalReq = await getNetworkContractApproval(
        selectedToken!,
        amount
      );
      if (isApprovalReq) {
        setShowModal(true);
      } else await addProtection(true);
    } catch (e) {
      dispatch(
        addNotification({
          type: NotificationType.error,
          title: 'Transaction Failed',
          msg: `${
            selectedToken!.symbol
          } approval had failed. Please try again or contact support.`,
        })
      );
    }
  };

  const addProtection = async (approved: boolean = false) => {
    if (!selectedToken) return;
    if (!selectedPool) return;
    if (!account) {
      dispatch(openWalletModal(true));
      return;
    }

    if (!approved) return checkApproval();

    const liquidityProtectionContract = await liquidityProtection$
      .pipe(first())
      .toPromise();

    const reserveAmountWei = expandToken(amount, selectedToken.decimals);
    const govToken = await govTokenAddress$.pipe(first()).toPromise();
    const bntToken = await bntTokenAddress$.pipe(first()).toPromise();
    const depositIsBnt = selectedToken.address === bntToken;

    const user = await onLogin$.pipe(first()).toPromise();

    const txHash = await addLiquidity({
      user,
      anchor: selectedPool.pool_dlt_id,
      liquidityProtection: liquidityProtectionContract,
      reserveAddress: selectedToken.address,
      reserveAmountWei,
      onConfirmation: () => {
        const tokensToFetch = [
          selectedToken,
          ethToken,
          ...(depositIsBnt ? [govToken] : []),
        ];
        // fetchBalances(tokensToFetch);
        // wait(4000).then(() => fetchBalances(tokensToFetch));
      },
    });

    dispatch(
      addNotification({
        type: NotificationType.pending,
        title: 'Transaction Pending',
        msg: `Adding liquidity...`,
      })
    );
  };

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
      <div className="widget mx-auto">
        <ModalApprove
          isOpen={showModal}
          promptSelected={(state) => setShowModal(!state)}
          amount={amount}
          fromToken={selectedToken!}
          handleApproved={() => addProtection(true)}
          waitForApproval={true}
        />
        <div className="flex justify-between p-14">
          <SwapSwitch />
          <div className="text-center">
            <h1 className="font-bold">Add Liquidity </h1>
            <h3>Single-Sided</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-10 px-5 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <IconTimes className="w-14" />
          </button>
        </div>
        <hr className="widget-separator" />

        <div className="px-10">
          <div className="bg-blue text-primary dark:text-blue-light border rounded dark:border-blue-5 rounded-lg p-20 bg-blue-0 dark:bg-blue-5">
            <h2 className="mb-6 font-semibold">
              Learn what it means to add liquidity to a pool:
            </h2>
            <ol>
              <li>1. How do I make money by providing liquidity? </li>
              <li>2. What is impermanent loss?</li>
              <li>3. How does Bancor protect me from impermanent loss?</li>
            </ol>
          </div>
          <div className="flex justify-between p-4 mt-8">
            <div className="text-blue-4 flex ">
              <span className="m-auto dark:text-grey-0 ">Stake in pool</span>
            </div>
            <div
              className="border border-black dark:border-grey-3 rounded rounded-lg p-4"
              onClick={() => setIsOpen(true)}
            >
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center bg-white dark:bg-blue-4 rounded-10 px-40 py-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex">
                    {listPool &&
                      listPool.reserves.map(({ symbol, logoURI }, index) => (
                        <Image
                          key={symbol}
                          src={logoURI}
                          alt={`${symbol} Token`}
                          className={`bg-grey-2 rounded-full h-28 w-28 ${
                            index === 1 ? 'mr-4' : ''
                          }`}
                        />
                      ))}
                  </div>
                  <div className="grid justify-items-start mb-4 ml-15">
                    <div className="text-16">
                      {listPool.reserves
                        .map((reserve) => reserve.symbol)
                        .join('/')}
                    </div>
                  </div>
                </div>{' '}
                <IconChevronDown className="w-10 ml-10" />
              </button>
            </div>
          </div>
          <div className="mb-12">
            <TokenInputField
              setInput={setAmount}
              selectable={true}
              border
              includedTokens={
                selectedPool ? selectedPool.reserves.map((x) => x.address) : []
              }
              input={amount}
              label="Stake Amount"
              token={selectedToken!}
              amountUsd={amountUsd}
              setAmountUsd={setAmountUsd}
              setToken={(token) => setToken(token)}
            />
          </div>

          <SearchablePoolList
            includedPoolAnchors={[]}
            onClick={(p) => {
              setPool(pools.find((pool) => pool.pool_dlt_id === p.id)!);
            }}
            setIsOpen={setIsOpen}
            isOpen={isOpen}
          />
          <div className=" rounded rounded-lg mb-10 bg-blue-0 dark:bg-blue-5 dark:text-grey-0 text-blue-4 p-20">
            <div className="flex  justify-between">
              <div>Space Available</div>
              <div>{spaceIsLoading ? 'Loading' : spaceAvailableLabel}</div>
            </div>
            <div className="flex justify-between">
              <div>BNT needed to open up space</div>
              <div>21,342 ETH</div>
            </div>
          </div>

          <button
            onClick={() => {
              addProtection();
            }}
            className={`${buttonVariant()} rounded w-full`}
            disabled={false}
          >
            {'Add Protection'}
          </button>
        </div>
      </div>
    ) || <div>Invalid anchor!</div>
  );
};
