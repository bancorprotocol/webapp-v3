import { Modal } from 'components/modal/Modal';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { useMemo, useState } from 'react';
import { Token } from 'services/observables/tokens';
import { wait } from 'utils/pureFunctions';
import {
  stakeAmount,
  unstakeAmount,
} from 'services/web3/governance/governance';
import { useWeb3React } from '@web3-react/core';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchTokenBalances } from 'services/observables/balances';
import { updateTokens } from 'redux/bancor/bancor';
import {
  rejectNotification,
  stakeFailedNotification,
  stakeNotification,
  unstakeFailedNotification,
  unstakeNotification,
} from 'services/notifications/notifications';
import { useApproveModal } from 'hooks/useApproveModal';
import { TokenInputPercentage } from 'components/tokenInputPercentage/TokenInputPercentage';
import { ApprovalContract } from 'services/web3/approval';

interface ModalVbntProps {
  setIsOpen: Function;
  isOpen: boolean;
  token: Token;
  stake: boolean;
  stakeBalance?: string;
  onCompleted?: Function;
}

export const ModalVbnt = ({
  setIsOpen,
  isOpen,
  token,
  stake,
  stakeBalance,
  onCompleted,
}: ModalVbntProps) => {
  const { account, chainId } = useWeb3React();
  const [amount, setAmount] = useState('');
  const percentages = useMemo(() => [25, 50, 75, 100], []);
  const [, setSelPercentage] = useState<number>(-1);
  const dispatch = useDispatch();

  const stakeDisabled = !account || !chainId || !amount || Number(amount) === 0;

  const fieldBlance = stake
    ? token.balance
      ? token.balance
      : undefined
    : stakeBalance;

  useEffect(() => {
    if (amount && fieldBlance) {
      const percentage = (Number(amount) / Number(fieldBlance)) * 100;
      setSelPercentage(
        percentages.findIndex((x) => percentage.toFixed(10) === x.toFixed(10))
      );
    }
  }, [amount, token, percentages, fieldBlance]);

  const handleStakeUnstake = async () => {
    if (stakeDisabled || !account || !chainId) return;

    if (stake)
      await stakeAmount(
        amount,
        token,
        (txHash: string) => stakeNotification(dispatch, amount, txHash),
        () => refreshBalances(token, account),
        () => rejectNotification(dispatch),
        () => stakeFailedNotification(dispatch, amount)
      );
    else
      await unstakeAmount(
        amount,
        token,
        (txHash: string) => unstakeNotification(dispatch, amount, txHash),
        () => refreshBalances(token, account),
        () => rejectNotification(dispatch),
        () => unstakeFailedNotification(dispatch, amount)
      );
  };

  const [checkApprove, ModalApprove] = useApproveModal(
    [{ amount: amount, token: token }],
    handleStakeUnstake,
    ApprovalContract.Governance
  );

  const refreshBalances = async (token: Token, account: string) => {
    await wait(8000);
    const balances = await fetchTokenBalances([token], account);
    dispatch(updateTokens(balances));
    if (onCompleted) onCompleted();
  };

  return (
    <>
      <Modal
        title={`${stake ? 'Stake' : 'Unstake'} vBNT`}
        titleElement={<SwapSwitch />}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        separator
        large
      >
        <div className="p-10">
          <div className="flex flex-col items-center text-12 mx-20">
            <div className="text-20 font-semibold mb-10"></div>
            {false && (
              <div className="text-blue-4 text-12 mx-10 text-center">
                Chose the amount you want to stake. you can decide if you want
                the amount in Dollars or Token input
              </div>
            )}
            <TokenInputPercentage
              label={`${stake ? 'Stake' : 'Unstake'} amount`}
              token={token}
              balance={fieldBlance}
              amount={amount}
              setAmount={setAmount}
            />
            <button
              onClick={() => {
                setAmount('');
                setIsOpen(false);
                if (stake) checkApprove();
                else handleStakeUnstake();
              }}
              disabled={stakeDisabled}
              className={`btn-primary rounded w-full mt-30 mb-10`}
            >
              {`${stake ? 'Stake' : 'Unstake'} vBNT`}
            </button>
          </div>
        </div>
      </Modal>
      {ModalApprove}
    </>
  );
};
