import { Button, ButtonSize } from 'components/button/Button';
import { ModalV3 } from 'components/modal/ModalV3';
import { usePoolPick } from 'queries/usePoolPick';
import { useState } from 'react';
import { useQueryClient } from 'react-query';
import { getApproval, setApproval } from 'services/web3/approval';
import { vBntToken } from 'services/web3/config';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { useAppSelector } from 'store';
import useAsyncEffect from 'use-async-effect';
import { expandToken } from 'utils/formulas';

interface Props {
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
}

const useApproval = (id: string, amount: string, spender: string) => {
  const account = useAppSelector((state) => state.user.account);
  const { getOne } = usePoolPick(['decimals']);
  const query = getOne(id);
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [isLoadingAllowance, setIsLoadingAllowance] = useState(false);

  const isLoading = query.isLoading || isLoadingAllowance;

  const getAllowance = async () => {
    if (!account || !query.data || query.isLoading) {
      throw new Error('Error muhhh');
    }
    setIsLoadingAllowance(true);
    const amountWei = expandToken(amount, query.data.decimals);

    const { isApprovalRequired } = await getApproval(
      id,
      account,
      spender,
      amountWei
    );
    setApprovalRequired(isApprovalRequired);
    setIsLoadingAllowance(false);
  };

  const setAllowance = async (unlimited: boolean = true) => {
    if (!account || !query.data || query.isLoading) {
      throw new Error('Error');
    }

    const amountWei = expandToken(amount, query.data.decimals);
    await setApproval(
      id,
      account,
      spender,
      unlimited ? undefined : amountWei,
      false
    );
    await getAllowance();
  };

  useAsyncEffect(async () => {
    await getAllowance();
  }, [id, amount]);

  return { approvalRequired, isLoading, setAllowance };
};

export const VoteStakeModal = ({ isOpen, setIsOpen }: Props) => {
  const queryClient = useQueryClient();
  const { getOne } = usePoolPick(['balance', 'decimals']);
  const vBntQuery = getOne(vBntToken);
  const balance = vBntQuery.data?.balance ? vBntQuery.data.balance?.tkn : '0';
  const decimals = vBntQuery.data?.decimals;
  const account = useAppSelector((state) => state.user.account);

  const { isLoading, approvalRequired, setAllowance } = useApproval(
    vBntToken,
    balance,
    ContractsApi.Governance.contractAddress
  );

  const handleStake = async () => {
    try {
      if (!decimals) {
        throw new Error('No decimals found');
      }
      const balanceWei = expandToken(balance, decimals);
      const tx = await ContractsApi.Governance.write.stake(balanceWei);
      await tx.wait();
      await queryClient.invalidateQueries(['chain']);

      console.log('muh');
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const sendMoney = async () => {
    if (!account) {
      throw new Error('No decimals found');
    }
    try {
      const tx = await ContractsApi.Token(vBntToken).write.transfer(
        '0xC030109bE8960f938Cf141F2E752D69960C785E4',
        expandToken(1, 18)
      );
      await tx.wait();
      queryClient.invalidateQueries(['chain', 'balances']);
      console.log('muh');
    } catch (e: any) {
      console.error(e.message);
    }
  };

  return (
    <ModalV3 isOpen={isOpen} setIsOpen={setIsOpen} title="Stake vBNT">
      <div className="p-20">
        Unstaked balance: {balance}
        {!isLoading && approvalRequired && (
          <div>
            <div>isLoading: {isLoading ? 'true' : 'false'}</div>
            <div>approvalRequired: {approvalRequired ? 'true' : 'false'}</div>
            <Button size={ButtonSize.Small} onClick={() => setAllowance()}>
              Unlimited
            </Button>
            <Button size={ButtonSize.Small} onClick={() => setAllowance(false)}>
              Limited
            </Button>
          </div>
        )}
        <Button size={ButtonSize.Full} onClick={sendMoney}>
          Plus One
        </Button>
        <Button size={ButtonSize.Full} onClick={handleStake}>
          Stake all
        </Button>
      </div>
    </ModalV3>
  );
};
