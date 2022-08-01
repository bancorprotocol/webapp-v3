import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ModalV3 } from 'components/modal/ModalV3';
import { usePoolPick } from 'queries';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getApproval, setApproval } from 'services/web3/approval';
import { vBntToken } from 'services/web3/config';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { useAppSelector } from 'store';
import useAsyncEffect from 'use-async-effect';
import { expandToken } from 'utils/formulas';
import { TokenInputPercentageV3New } from 'components/tokenInputPercentage/TokenInputPercentageV3New';
import { toBigNumber } from 'utils/helperFunctions';

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
      throw new Error('Error getAllowance');
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
    if (account && query.data && !query.isLoading) {
      await getAllowance();
    }
  }, [id, amount, account]);

  return { approvalRequired, isLoading, setAllowance };
};

export const VoteStakeModal = ({ isOpen, setIsOpen }: Props) => {
  const queryClient = useQueryClient();
  const { getOne } = usePoolPick(['balance', 'decimals']);
  const vBntQuery = getOne(vBntToken);
  const balance = vBntQuery.data?.balance ? vBntQuery.data.balance?.tkn : '0';
  const decimals = vBntQuery.data?.decimals;
  const account = useAppSelector((state) => state.user.account);

  const handleStake = async () => {
    try {
      if (!decimals) {
        throw new Error('No decimals found');
      }
      const inputWei = expandToken(input, decimals);
      const tx = await ContractsApi.Governance.write.stake(inputWei);
      await tx.wait();
      await queryClient.invalidateQueries(['chain']);
      setInput('');
      setIsOpen(false);

      console.log('muh');
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const [input, setInput] = useState('');
  const [inputFiat, setInputFiat] = useState('');

  const isInsufficientBalance = toBigNumber(balance).lt(input);

  const { isLoading, approvalRequired, setAllowance } = useApproval(
    vBntToken,
    input,
    ContractsApi.Governance.contractAddress
  );

  return (
    <ModalV3 isOpen={isOpen} setIsOpen={setIsOpen} large title="Stake vBNT">
      <div className="p-20">
        <TokenInputPercentageV3New
          label="Amount"
          balanceLabel="Available"
          balance={balance}
          dltId={vBntToken}
          inputTkn={input}
          setInputTkn={setInput}
          inputFiat={inputFiat}
          setInputFiat={setInputFiat}
          isFiat={false}
          isError={isInsufficientBalance}
        />
        <div className={'py-10'} />

        <div
          className={`bg-secondary content-block overflow-hidden ${
            approvalRequired && !isInsufficientBalance
              ? 'h-[134px]  p-10'
              : 'h-0 opacity-0 px-10'
          } transition-all duration-500 ease-in-out`}
        >
          <h3>Approval required</h3>
          <div className={'text-secondary mb-10'}>
            Before you can proceed, please set the allowance for the Bancor
            Governance Contract.
          </div>
          <div className={'flex space-x-10'}>
            <Button
              variant={ButtonVariant.Secondary}
              size={ButtonSize.Small}
              className={'!w-full'}
              onClick={() => setAllowance(false)}
            >
              Limited
            </Button>
            <Button
              size={ButtonSize.Small}
              className={'!w-full'}
              onClick={() => setAllowance()}
            >
              Unlimited
            </Button>
          </div>
        </div>

        <div className={'mt-20 flex items-end'}>
          <Button
            size={ButtonSize.Full}
            onClick={handleStake}
            disabled={
              isLoading ||
              approvalRequired ||
              !input ||
              isInsufficientBalance ||
              toBigNumber(input).isZero()
            }
          >
            Stake vBNT
          </Button>
        </div>
      </div>
    </ModalV3>
  );
};
