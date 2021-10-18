import { NotificationType } from 'redux/notification/notification';
import { take } from 'rxjs/operators';
import { networkVars$ } from 'services/observables/network';
import { Token } from 'services/observables/tokens';
import { shrinkToken, expandToken } from 'utils/formulas';
import { web3, writeWeb3 } from 'services/web3';
import { ErrorCode } from '../types';
import { Governance__factory } from '../abis/types';

export const getStakedAmount = async (
  user: string,
  govToken: Token
): Promise<string> => {
  const networkVars = await networkVars$.pipe(take(1)).toPromise();
  const govContract = Governance__factory.connect(
    networkVars.governanceContractAddress,
    web3.provider
  );
  const amount = await govContract.votesOf(user);
  return shrinkToken(amount.toString(), govToken.decimals);
};

export const stakeAmount = async (
  amount: string,
  govToken: Token,
  onConfirmation: Function
) => {
  try {
    const expandedAmount = expandToken(amount, govToken.decimals);

    const networkVars = await networkVars$.pipe(take(1)).toPromise();
    const govContract = Governance__factory.connect(
      networkVars.governanceContractAddress,
      writeWeb3.signer
    );

    const tx = await govContract.stake(expandedAmount);

    return {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Staking vBNT is pending confirmation',
      txHash: tx.hash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `Your stake of ${amount} vBNT has been confirmed`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Staking ${amount} vBNT had failed. Please try again or contact support.`,
      },
      onCompleted: () => onConfirmation(),
    };
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx)
      return {
        type: NotificationType.error,
        title: 'Transaction Rejected',
        msg: 'You rejected the transaction. If this was by mistake, please try again.',
      };

    return {
      type: NotificationType.error,
      title: 'Transaction Failed',
      msg: `Staking ${amount} vBNT had failed. Please try again or contact support.`,
    };
  }
};

export const unstakeAmount = async (
  amount: string,
  govToken: Token,
  onConfirmation: Function
) => {
  try {
    const expandedAmount = expandToken(amount, govToken.decimals);

    const networkVars = await networkVars$.pipe(take(1)).toPromise();
    const govContract = Governance__factory.connect(
      networkVars.governanceContractAddress,
      writeWeb3.signer
    );

    const tx = await govContract.unstake(expandedAmount);

    return {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Unstaking vBNT is pending confirmation',
      txHash: tx.hash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `Unstaking ${amount} vBNT has been confirmed`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Unstaking ${amount} vBNT had failed. Please try again or contact support.`,
      },
      onCompleted: () => onConfirmation(),
    };
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx)
      return {
        type: NotificationType.error,
        title: 'Transaction Rejected',
        msg: 'You rejected the transaction. If this was by mistake, please try again.',
      };

    return {
      type: NotificationType.error,
      title: 'Transaction Failed',
      msg: `Unstaking ${amount} vBNT had failed. Please try again or contact support.`,
    };
  }
};

//Remaining time in seconds
export const getUnstakeTimer = async (user: string) => {
  const networkVars = await networkVars$.pipe(take(1)).toPromise();
  const govContract = Governance__factory.connect(
    networkVars.governanceContractAddress,
    web3.provider
  );
  const locks = await govContract.voteLocks(user);
  const timeInSeconds = Number(locks) - Date.now() / 1000;
  return timeInSeconds < 0 ? 0 : timeInSeconds;
};
