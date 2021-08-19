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
import { expandToken } from 'utils/pureFunctions';
import { bntToken, ethToken } from 'services/web3/config';
import { addLiquidity } from 'services/web3/contracts/liquidityProtection/wrapper';
import { onLogin$ } from 'services/observables/user';
import { SearchablePoolList } from 'components/searchablePoolList/SearchablePoolList';

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
  }, [pools]);

  const [selectedToken, setToken] = useState<Token | undefined>(
    tokens.find((token) => token.address === selectedPool?.reserves[0].address)
  );

  useEffect(() => {
    const isBnt = selectedToken?.symbol === 'BNT';
    const bntTokenAddress = tokens.find(token => token.symbol === 'BNT')?.address;
    if (!isBnt) {
      const tknReserve = selectedPool?.reserves.find(
        (reserve) => reserve.address !== bntTokenAddress
      );
      setToken(tokens.find(token => token.address === tknReserve?.address))
    }
  }, [selectedPool]);

  console.log({
    isValidAnchor,
    selectedToken,
    selectedPool,
  });

  const [showModal, setShowModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [stakeAvailable, setAvailable] = useState('343.54 ETH');
  useEffect(() => {
    const randomNumber = (Math.random() * 100).toFixed(2)
    setAvailable(`${randomNumber} ETH`)
  }, [selectedPool]);

  if (!isValidAnchor) return <div>Invalid Anchor!</div>;

  const checkApproval = async () => {
    console.log('checkApproval');
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
  };

 

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    (
      <div className="widget">
        <ModalApprove
          isOpen={showModal}
          setIsOpen={setShowModal}
          amount={amount}
          fromToken={selectedToken!}
          handleApproved={() => addProtection(true)}
          waitForApproval={true}
        />

        <h1>Add Single-Sided Liquidity </h1>
        <div className="bg-blue border rounded rounded-lg p-10 bg-blue-0">
          <h2 className="mb-6">
            Learn what it means to add liquidity to a pool:
          </h2>
          <ol>
            <li>1. How do I make money by providing liquidity? </li>
            <li>2. What is impermanent loss?</li>
            <li>3. How does Bancor protect me from impermanent loss?</li>
          </ol>
        </div>
        <div className="flex justify-between">
          <div>Stake in pool</div>
          <div onClick={() => setIsOpen(true)}>Dropdown goes here</div>
        </div>
        <div></div>
        <TokenInputField
          setInput={setAmount}
          selectable={true}
          includedTokens={
            selectedPool ? selectedPool.reserves.map((x) => x.address) : []
          }
          input={amount}
          label="Stake Amount"
          token={selectedToken!}
          amountUsd={'1.2'}
          setAmountUsd={() => 3}
          setToken={token => setToken(token)}
        />

        <SearchablePoolList
          includedPoolAnchors={[]}
          onClick={(p) => {
            setPool(pools.find((pool) => pool.pool_dlt_id === p.id)!);
          }}
          setIsOpen={setIsOpen}
          isOpen={isOpen}
        />
        <div className="p-10 px-14 rounded rounded-lg mb-10 bg-blue-0 flex justify-between">
          <h3>Space Available</h3>
          <h3>{stakeAvailable}</h3>
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
    ) || <div>Invalid anchor!</div>
  );
};
