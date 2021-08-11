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

  const [selectedReserve, setReserve] = useState(selectedPool?.reserves[0]);
  const [selectedToken] = useState(
    tokens.find((token) => token.address === selectedReserve?.address) || null
  );

  console.log({
    isValidAnchor,
    selectedToken: selectedReserve,
    selected: selectedToken,
    selectedPool,
  });

  const [showModal, setShowModal] = useState(false);

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
    if (!account) {
      dispatch(openWalletModal(true));
      return;
    }

    if (!approved) return checkApproval();
  };

  return isLoading ? (
    <div>Loading...</div>
  ) : (
    (
      <div className="">
        <ModalApprove
          isOpen={showModal}
          setIsOpen={setShowModal}
          amount={amount}
          fromToken={selectedToken!}
          handleApproved={() => addProtection(true)}
          waitForApproval={true}
        />

        <h1>Add Protection </h1>
        <TokenInputField
          setInput={setAmount}
          includedTokens={
            selectedPool ? selectedPool.reserves.map((x) => x.address) : []
          }
          input={amount}
          label="Pool Amount"
          token={selectedToken}
          amountUsd={'1.2'}
          setAmountUsd={() => 3}
          setToken={() => 3}
        />

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
