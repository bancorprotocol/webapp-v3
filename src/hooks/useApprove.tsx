import { useState } from 'react';
import { Token } from 'services/observables/tokens';
import { getTokenContractApproval } from 'services/web3/contracts/converter/wrapper';

interface TokenAmount {
  amount: string;
  token: Token;
}

interface TokenAmountWithApproval extends TokenAmount {
  isApprovalRequired: boolean;
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
    const approvals = await Promise.all(
      tokens.map(async ({ token, amount }) => ({
        token,
        amount,
        isApprovalRequired: await getTokenContractApproval(
          token,
          amount,
          spendingContract
        ),
      }))
    );

    const approvalsRequired = approvals.filter(
      (approval) => approval.isApprovalRequired
    );
    if (approvalsRequired.length === 0) {
      approved();
      setIsOpen(false);
      return;
    }
    for (const approval of approvalsRequired) {
      setSelectedToken(approval.token);
      setSelectedAmount(approval.amount);
      setIsOpen(true);
    }
    setRemainingApprovals(approvalsRequired);
    setHandleApproved(() => (tokenAddress: string) => {});
  };

  return [
    triggerCheck,
    isOpen,
    selectedToken,
    selectedAmount,
    waitForConfirmation,
    handleApproved,
  ];
};
