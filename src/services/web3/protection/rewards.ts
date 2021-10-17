import { stakingRewards$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { expandToken, shrinkToken } from 'utils/formulas';

export const stakeRewards = async ({
  maxAmount,
  poolId,
  currentUser,
}: {
  maxAmount: string;
  poolId: string;
  currentUser: string;
}): Promise<string> => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = buildStakingRewardsContract(contractAddress, writeWeb3);
  return resolveTxOnConfirmation({
    tx: contract.methods.stakeRewards(expandToken(maxAmount, 18), poolId),
    user: currentUser,
    resolveImmediately: true,
  });
};

export const claimRewards = async (user: string): Promise<string> => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = buildStakingRewardsContract(contractAddress, writeWeb3);
  return resolveTxOnConfirmation({
    tx: contract.methods.claimRewards(),
    user,
    resolveImmediately: true,
  });
};

export const fetchTotalClaimedRewards = async (
  currentUser: string
): Promise<string> => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = buildStakingRewardsContract(contractAddress);
  const result = await contract.methods.totalClaimedRewards(currentUser).call();

  return shrinkToken(result, 18);
};

export const fetchPendingRewards = async (
  currentUser: string
): Promise<string> => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = buildStakingRewardsContract(contractAddress);
  const result = await contract.methods.pendingRewards(currentUser).call();

  return shrinkToken(result, 18);
};
