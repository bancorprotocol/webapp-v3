import { stakingRewards$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { expandToken, shrinkToken } from 'utils/formulas';
import { StakingRewards, StakingRewards__factory } from '../abis/types';
import { web3, writeWeb3 } from '..';
import { ProtectedLiquidity } from './positions';
import { multicall, MultiCall } from '../multicall/multicall';
import { ErrorCode } from '../types';
import { changeGas } from '../config';

export const stakeRewards = async ({
  amount,
  poolId,
  onHash,
  onCompleted,
  rejected,
  failed,
}: {
  amount: string;
  poolId: string;
  onHash: (txHash: string) => void;
  onCompleted: Function;
  rejected: Function;
  failed: (error: string) => void;
}) => {
  try {
    const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();

    const contract = StakingRewards__factory.connect(
      contractAddress,
      writeWeb3.signer
    );

    const estimate = await contract.estimateGas.stakeRewards(
      expandToken(amount, 18),
      poolId
    );
    const gasLimit = changeGas(estimate.toString());

    const tx = await contract.stakeRewards(expandToken(amount, 18), poolId, {
      gasLimit,
    });
    onHash(tx.hash);
    await tx.wait();
    onCompleted();
  } catch (e: any) {
    console.error(e);
    if (e.code === ErrorCode.DeniedTx) rejected();
    else failed(e.message);
  }
};

export const stakePoolLevelRewards = async ({
  amount,
  poolId,
  reserveId,
  newPoolId,
  onHash,
  onCompleted,
  rejected,
  failed,
}: {
  amount: string;
  poolId: string;
  reserveId: string;
  newPoolId: string;
  onHash: (txHash: string) => void;
  onCompleted: Function;
  rejected: Function;
  failed: (error: string) => void;
}) => {
  try {
    const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
    const contract = StakingRewards__factory.connect(
      contractAddress,
      writeWeb3.signer
    );

    const tx = await contract.stakeReserveRewards(
      poolId,
      reserveId,
      expandToken(amount, 18),
      newPoolId
    );
    onHash(tx.hash);
    await tx.wait();
    onCompleted();
  } catch (e: any) {
    console.error(e);
    if (e.code === ErrorCode.DeniedTx) rejected();
    else failed(e.message);
  }
};

export const claimRewards = async (): Promise<string> => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = StakingRewards__factory.connect(
    contractAddress,
    writeWeb3.signer
  );

  const estimate = await contract.estimateGas.claimRewards();
  const gasLimit = changeGas(estimate.toString());

  return (await contract.claimRewards({ gasLimit })).hash;
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

export const fetchedRewardsMultiplier = async (
  user: string,
  positions: ProtectedLiquidity[]
) => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = StakingRewards__factory.connect(
    contractAddress,
    web3.provider
  );
  const calls = positions.map((position) =>
    buildRewardsMultiplierCall(contract, user, position)
  );
  const res = await multicall(calls);
  if (res)
    return res.map((x, i) => ({
      id: positions[i].id,
      rewardsMultiplier: shrinkToken(x.toString(), 6),
    }));

  return [];
};

const buildRewardsMultiplierCall = (
  contract: StakingRewards,
  user: string,
  position: ProtectedLiquidity
): MultiCall => {
  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'rewardsMultiplier',
    methodParameters: [user, position.poolToken, position.reserveToken.address],
  };
};

export const fetchedPendingRewards = async (
  user: string,
  positions: ProtectedLiquidity[]
) => {
  const contractAddress = await stakingRewards$.pipe(take(1)).toPromise();
  const contract = StakingRewards__factory.connect(
    contractAddress,
    web3.provider
  );

  const calls = positions.map((position) =>
    buildPnedingRewardsCall(contract, user, position)
  );
  const res = await multicall(calls);
  if (res)
    return res.map((x, i) => ({
      id: positions[i].id,
      rewardsAmount: shrinkToken(x.toString(), 18),
    }));

  return [];
};

const buildPnedingRewardsCall = (
  contract: StakingRewards,
  user: string,
  position: ProtectedLiquidity
): MultiCall => {
  return {
    contractAddress: contract.address,
    interface: contract.interface,
    methodName: 'pendingReserveRewards',
    methodParameters: [user, position.poolToken, position.reserveToken.address],
  };
};
