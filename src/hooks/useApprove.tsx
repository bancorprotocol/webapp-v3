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
    () => (tokenAddress: string) => { }
  );

  const triggerCheck = async () => {
    console.log('triggering check inside')
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
    console.log('approvals', approvals);

    const approvalsRequired = approvals.filter(
      (approval) => approval.isApprovalRequired
    );
    if (approvalsRequired.length === 0) {
      setIsOpen(false);
      approved();
      return;
    }
    setRemainingApprovals(approvalsRequired);
    setIsOpen(true);
    setHandleApproved(() => (tokenAddress: string) => {
      const remaining = remainingApprovals.filter(approval => approval.token.address !== tokenAddress);
      setRemainingApprovals(remaining);
      if (remaining.length === 0) {
        setIsOpen(false);
        approved();
        return;
      }
      setSelectedToken(remaining[0].token);
      setSelectedAmount(remaining[0].amount);
    })
  };

  return [
    triggerCheck,
    isOpen,
    selectedToken,
    selectedAmount,
    waitForConfirmation,
    handleApproved,
  ] as [
    () => Promise<void>,
    boolean,
    Token,
    string,
    boolean,
    (tokenAddress: string) => void
  ]
};
