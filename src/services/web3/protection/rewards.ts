import { stakingRewards$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { expandToken, shrinkToken } from 'utils/formulas';
import { StakingRewards__factory } from '../abis/types';
import { web3, writeWeb3 } from '..';

export const stakeRewards = async ({
  amount,
  poolId,
}: {
  amount: string;
  poolId: string;
}): Promise<string> => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = StakingRewards__factory.connect(
    contractAddress,
    writeWeb3.signer
  );

  return (await contract.stakeRewards(expandToken(amount, 18), poolId)).hash;
};

export const claimRewards = async (): Promise<string> => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = StakingRewards__factory.connect(
    contractAddress,
    writeWeb3.signer
  );

  return (await contract.claimRewards()).hash;
};

export const fetchTotalClaimedRewards = async (
  currentUser: string
): Promise<string> => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = StakingRewards__factory.connect(
    contractAddress,
    web3.provider
  );
  const result = await contract.totalClaimedRewards(currentUser);

  return shrinkToken(result.toString(), 18);
};

export const fetchPendingRewards = async (
  currentUser: string
): Promise<string> => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = StakingRewards__factory.connect(
    contractAddress,
    web3.provider
  );
  const result = await contract.pendingRewards(currentUser);

  return shrinkToken(result.toString(), 18);
};
