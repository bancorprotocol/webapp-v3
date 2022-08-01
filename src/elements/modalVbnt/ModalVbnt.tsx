import { Modal } from 'components/modal/Modal';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { useMemo, useState } from 'react';
import { Token, updateUserBalances } from 'services/observables/tokens';
import { wait } from 'utils/pureFunctions';
import {
  stakeAmount,
  unstakeAmount,
} from 'services/web3/governance/governance';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
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
import { useAppSelector } from 'store';
import { Button, ButtonSize } from 'components/button/Button';
import {
  GovEvent,
  GovProperties,
  sendGovEvent,
} from 'services/api/googleTagManager/gov';
import { getFiat } from 'services/api/googleTagManager';

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
  const account = useAppSelector((state) => state.user.account);
  const isFiat = useAppSelector((state) => state.user.usdToggle);
  const [amount, setAmount] = useState('');
  const percentages = useMemo(() => [25, 50, 75, 100], []);
  const [selPercentage, setSelPercentage] = useState<number>(-1);
  const dispatch = useDispatch();

  const stakeDisabled = !account || !amount || Number(amount) === 0;

  const fieldBlance = stake
    ? token.balance
      ? token.balance
      : undefined
    : stakeBalance;

  const govProperties: GovProperties = {
    stake_input_type: getFiat(isFiat),
    stake_token_amount_usd: amount,
    stake_token_portion_percent:
      selPercentage !== -1 ? percentages[selPercentage].toFixed(0) : 'N/A',
  };

  useEffect(() => {
    if (amount && fieldBlance) {
      const percentage = (Number(amount) / Number(fieldBlance)) * 100;
      setSelPercentage(
        percentages.findIndex((x) => percentage.toFixed(10) === x.toFixed(10))
      );
    }
  }, [amount, token, percentages, fieldBlance]);

  const handleStakeUnstake = async () => {
    if (stakeDisabled || !account) return;

    sendGovEvent(GovEvent.Click, govProperties, stake);
    sendGovEvent(GovEvent.WalletRequest, govProperties, stake);
    if (stake)
      await stakeAmount(
        amount,
        token,
        (txHash: string) => {
          stakeNotification(dispatch, amount, txHash);
          sendGovEvent(GovEvent.WalletConfirm, govProperties, stake);
        },
        () => {
          refreshBalances();
          sendGovEvent(GovEvent.Success, govProperties, stake);
        },
        (error: string) => {
          rejectNotification(dispatch);
          sendGovEvent(GovEvent.Failed, govProperties, stake, undefined, error);
        },
        (error: string) => {
          stakeFailedNotification(dispatch, amount);
          sendGovEvent(GovEvent.Failed, govProperties, stake, undefined, error);
        }
      );
    else
      await unstakeAmount(
        amount,
        token,
        (txHash: string) => {
          unstakeNotification(dispatch, amount, txHash);
          sendGovEvent(GovEvent.WalletConfirm, govProperties, stake);
        },
        () => {
          refreshBalances();
          sendGovEvent(GovEvent.Success, govProperties, stake);
        },
        (error: string) => {
          rejectNotification(dispatch);
          sendGovEvent(GovEvent.Failed, govProperties, stake, undefined, error);
        },
        (error: string) => {
          unstakeFailedNotification(dispatch, amount);
          sendGovEvent(GovEvent.Failed, govProperties, stake, undefined, error);
        }
      );
  };

  const [checkApprove, ModalApprove] = useApproveModal(
    [{ amount: amount, token }],
    handleStakeUnstake,
    ApprovalContract.Governance,
    () => sendGovEvent(GovEvent.UnlimitedPopup, govProperties, stake),
    (isUnlimited: boolean) =>
      sendGovEvent(
        GovEvent.UnlimitedPopupSelect,
        govProperties,
        stake,
        isUnlimited
      )
  );

  const refreshBalances = async () => {
    await wait(8000);
    await updateUserBalances();
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
          <div className="text-12 mx-20">
            <div className="text-20 font-semibold mb-10"></div>
            <TokenInputPercentage
              label={`${stake ? 'Stake' : 'Unstake'} amount`}
              token={token}
              balance={fieldBlance}
              amount={amount}
              setAmount={setAmount}
            />
            <Button
              onClick={() => {
                setAmount('');
                setIsOpen(false);
                if (stake) checkApprove();
                else handleStakeUnstake();
              }}
              disabled={stakeDisabled}
              className="mt-30 mb-20"
              size={ButtonSize.Full}
            >
              {`${stake ? 'Stake' : 'Unstake'} vBNT`}
            </Button>
          </div>
        </div>
      </Modal>
      {ModalApprove}
    </>
  );
};
