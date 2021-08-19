import { NotificationType } from 'redux/notification/notification';
import { take } from 'rxjs/operators';
import { networkVars$ } from 'services/observables/network';
import { Token } from 'services/observables/tokens';
import { expandToken, shrinkToken } from 'utils/pureFunctions';
import { resolveTxOnConfirmation } from '..';
import { web3, writeWeb3 } from '../contracts';
import { buildGovernanceContract } from '../contracts/governance/wrapper';

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
  govToken: Token
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
  } catch (error) {
    if (error.message.includes('User denied transaction signature'))
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

export const unstakeAmount = async (amount: string) => {
  const networkVars = await networkVars$.pipe(take(1)).toPromise();
  const govContract = buildGovernanceContract(
    networkVars.governanceContractAddress,
    writeWeb3
  );
  await govContract.methods.unstake(amount).call();
};

export const getUnstakeTimer = async () => {
  const networkVars = await networkVars$.pipe(take(1)).toPromise();
  const govContract = buildGovernanceContract(
    networkVars.governanceContractAddress,
    web3
  );

  const [voteDuration, voteLockFraction] = await Promise.all([
    govContract.methods.voteLockDuration().call(),
    govContract.methods.voteLockFraction().call(),
  ]);

  return Number(voteDuration) / Number(voteLockFraction) / 360;
};
