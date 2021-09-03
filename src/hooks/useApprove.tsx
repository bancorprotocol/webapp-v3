import { useEffect, useState } from 'react';
import { Token } from 'services/observables/tokens';
import { getTokenContractApproval } from 'services/web3/contracts/converter/wrapper';
import { wait } from 'utils/pureFunctions';
import { useInterval } from './useInterval';

interface TokenAmount {
  amount: string;
  token: Token;
}

interface TokenAmountWithApproval extends TokenAmount {
  isApprovalRequired: boolean;
  prompted: boolean;
}

export const useApprove = (
  tokens: TokenAmount[],
  spendingContract: string,
  waitForConfirmation: boolean,
  approved: () => void
) => {
  const [selectedToken, setSelectedToken] = useState(tokens[0].token);
  const [selectedAmount, setSelectedAmount] = useState(tokens[0].amount);
  const [isOpen, setIsOpen] = useState(false);

  const [remainingApprovals, setRemainingApprovals] = useState<
    TokenAmountWithApproval[]
  >([]);
  const [handleApproved, setHandleApproved] = useState(
    () => (tokenAddress: string) => {}
  );

  const triggerCheck = async () => {
    console.log('triggering check inside');
    const approvals = await Promise.all(
      tokens.map(async ({ token, amount }) => ({
        token,
        amount,
        isApprovalRequired: await getTokenContractApproval(
          token,
          amount,
          spendingContract
        ),
        prompted: false,
      }))
    );
    console.log('approvals', approvals);

    const approvalsRequired = approvals.filter(
      (approval) => approval.isApprovalRequired
    );
    if (approvalsRequired.length === 0) {
      setIsOpen(false);
      console.log('not opening, no approvals required');
      approved();
      return;
    }
    setRemainingApprovals(approvalsRequired);
    setIsOpen(true);
    console.log('setIsOpen should be thing');
    setHandleApproved(() => (tokenAddress: string) => {
      const remaining = remainingApprovals.filter(
        (approval) => approval.token.address !== tokenAddress
      );
      setRemainingApprovals(remaining);
      if (remaining.length === 0) {
        setIsOpen(false);
        approved();
        return;
      }
    });
  };

  const handleOpen = async (promptSelected: boolean) => {
    if (!promptSelected || remainingApprovals.length == 0) {
      setIsOpen(false);
      setHandleApproved(() => () => {});
      return;
    }
    setIsOpen(false);
    await wait(500);
    setIsOpen(true);
    setSelectedToken(remainingApprovals[0].token);
    setSelectedAmount(remainingApprovals[0].amount);
    setRemainingApprovals(remainingApprovals.slice(1));
  };

  return [
    triggerCheck,
    isOpen,
    selectedToken,
    selectedAmount,
    waitForConfirmation,
    handleApproved,
    handleOpen,
  ] as [
    () => Promise<void>,
    boolean,
    Token,
    string,
    boolean,
    (tokenAddress: string) => void,
    (promptSelected: boolean) => void
  ];
};
