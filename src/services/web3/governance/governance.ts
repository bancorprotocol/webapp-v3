import { NotificationType } from 'redux/notification/notification';
import { take } from 'rxjs/operators';
import { networkVars$ } from 'services/observables/network';
import { Token } from 'services/observables/tokens';
import { shrinkToken, expandToken } from 'utils/formulas';
import { resolveTxOnConfirmation } from '..';
import { web3, writeWeb3 } from '../contracts';
import { buildGovernanceContract } from '../contracts/governance/wrapper';
import { ErrorCode } from '../types';

export const getStakedAmount = async (
  user: string,
  govToken: Token
): Promise<string> => {
  const networkVars = await networkVars$.pipe(take(1)).toPromise();
  const govContract = buildGovernanceContract(
    networkVars.governanceContractAddress,
    web3
  );
  const amount = await govContract.methods.votesOf(user).call();

  return shrinkToken(amount, govToken.decimals);
};

export const stakeAmount = async (
  amount: string,
  user: string,
  govToken: Token,
  onConfirmation?: (hash: string) => void
) => {
  try {
    const expandedAmount = expandToken(amount, govToken.decimals);

    const networkVars = await networkVars$.pipe(take(1)).toPromise();
    const govContract = buildGovernanceContract(
      networkVars.governanceContractAddress,
      writeWeb3
    );

    const txHash = await resolveTxOnConfirmation({
      tx: govContract.methods.stake(expandedAmount),
      user,
      resolveImmediately: true,
      onConfirmation,
    });
    return {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Staking vBNT is pending confirmation',
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `Your stake of ${amount} vBNT has been confirmed`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Staking ${amount} vBNT had failed. Please try again or contact support.`,
      },
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
  user: string,
  govToken: Token,
  onConfirmation?: (hash: string) => void
) => {
  try {
    const expandedAmount = expandToken(amount, govToken.decimals);

    const networkVars = await networkVars$.pipe(take(1)).toPromise();
    const govContract = buildGovernanceContract(
      networkVars.governanceContractAddress,
      writeWeb3
    );

    const txHash = await resolveTxOnConfirmation({
      tx: govContract.methods.unstake(expandedAmount),
      user,
      resolveImmediately: true,
      onConfirmation,
    });
    return {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Unstaking vBNT is pending confirmation',
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `Unstaking ${amount} vBNT has been confirmed`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Unstaking ${amount} vBNT had failed. Please try again or contact support.`,
      },
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
  const govContract = buildGovernanceContract(
    networkVars.governanceContractAddress,
    web3
  );
  const locks = await govContract.methods.voteLocks(user).call();
  const timeInSeconds = Number(locks) - Date.now() / 1000;
  return timeInSeconds < 0 ? 0 : timeInSeconds;
};
