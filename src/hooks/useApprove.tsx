import { useState } from 'react';
import { Token } from 'services/observables/tokens';
import { getTokenContractApproval } from 'services/web3/contracts/converter/wrapper';
import { updateArray, wait } from 'utils/pureFunctions';
interface TokenAmount {
  amount: string;
  token: Token;
}

interface TokenAmountWithApproval extends TokenAmount {
  isApprovalRequired: boolean;
  prompted: boolean;
  approved: boolean;
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
    setSelectedToken(tokens[0].token);
    const approvals = await Promise.all(
      tokens.map(
        async ({ token, amount }): Promise<TokenAmountWithApproval> => ({
          token,
          amount,
          isApprovalRequired: await getTokenContractApproval(
            token,
            amount,
            spendingContract
          ),
          prompted: false,
          approved: false,
        })
      )
    );

    const approvalsRequired = approvals.filter(
      (approval) => approval.isApprovalRequired
    );
    if (approvalsRequired.length === 0) {
      setIsOpen(false);
      approved();
      return;
    }
    const toPrompt = approvalsRequired[0];
    setSelectedToken(toPrompt.token);
    setSelectedAmount(toPrompt.amount);
    setRemainingApprovals(
      updateArray(
        approvalsRequired,
        (approval) => approval.token.address === toPrompt.token.address,
        (approval) => ({ ...approval, prompted: true })
      )
    );
    setIsOpen(true);
    setHandleApproved(() => (tokenAddress: string) => {
      const newApprovals = updateArray(
        remainingApprovals,
        (approval) => approval.token.address === tokenAddress,
        (approval) => ({ ...approval, approved: true })
      );
      const allApproved = newApprovals.every((approval) => approval.approved);
      if (allApproved) {
        setIsOpen(false);
        approved();
        return;
      } else {
        setRemainingApprovals(newApprovals);
      }
    });
  };

  const handleOpen = async (promptSelected: boolean) => {
    const allPrompted = remainingApprovals.every(
      (approval) => approval.prompted
    );
    if (promptSelected || allPrompted) {
      setIsOpen(false);
      setHandleApproved(() => () => {});
      return;
    }
    setIsOpen(false);
    await wait(300);
    const promptedToken = remainingApprovals.find(
      (approval) => approval.prompted === false
    )!;
    const newApprovals = updateArray(
      remainingApprovals,
      (approval) => approval.token.address === promptedToken.token.address,
      (approval) => ({ ...approval, prompted: true })
    );

    setRemainingApprovals(newApprovals);
    setSelectedToken(promptedToken.token);
    setSelectedAmount(promptedToken.amount);
    await wait(300);
    setIsOpen(true);
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
