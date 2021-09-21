import Web3 from 'web3';
import { ContractMethods } from 'services/web3/types';
import { ContractSendMethod } from 'web3-eth-contract';
import { CallReturn } from 'eth-multicall';
import { buildContract } from 'services/web3/contracts';
import { ABIStakingRewards } from 'services/web3/contracts/swap/abi';
import { stakingRewards$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { shrinkToken } from 'utils/formulas';

export const buildStakingRewardsContract = (
  contractAddress: string,
  web3?: Web3
): ContractMethods<{
  stakeRewards: (maxAmount: string, poolToken: string) => ContractSendMethod;
  claimRewards: () => ContractSendMethod;
  totalClaimedRewards: (provider: string) => CallReturn<string>;
  pendingRewards: (provider: string) => CallReturn<string>;
  store: () => CallReturn<string>;
  pendingReserveRewards: (
    provider: string,
    poolToken: string,
    reserveToken: string
  ) => CallReturn<string>;
  rewardsMultiplier: (
    provider: string,
    poolToken: string,
    reserveToken: string
  ) => CallReturn<string>;
}> => buildContract(ABIStakingRewards, contractAddress, web3);

// export const stakeRewards = async ({
//   maxAmount,
//   poolId,
// }: {
//   maxAmount: string;
//   poolId: string;
// }) => {
//   const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
//   const contract = buildStakingRewardsContract(contractAddress);
//   const result = await contract.methods.stakeRewards(
//     expandToken(maxAmount, 18),
//     poolId
//   );
// };

export const fetchTotalClaimedRewards = async (currentUser: string) => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = buildStakingRewardsContract(contractAddress);
  const result = await contract.methods.totalClaimedRewards(currentUser).call();

  return shrinkToken(result, 18);
};

export const fetchPendingRewards = async (currentUser: string) => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = buildStakingRewardsContract(contractAddress);
  const result = await contract.methods.pendingRewards(currentUser).call();

  return shrinkToken(result, 18);
};
