import { stakingRewards$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { expandToken, shrinkToken } from 'utils/formulas';
import {
  StakingRewards,
  StakingRewards__factory,
} from 'services/web3/abis/types';
import { web3, writeWeb3 } from 'services/web3';
import { ProtectedLiquidity } from 'services/web3/protection/positions';
import { multicall, MultiCall } from 'services/web3/multicall/multicall';
import { Dictionary, ErrorCode } from 'services/web3/types';
import { changeGas } from 'services/web3/config';
import axios from 'axios';
import MerkleTree from 'merkletreejs';
import { SnapshotRewards } from 'services/observables/liquidity';
import { keccak256 } from 'ethers/lib/utils';
import { ethers } from 'ethers';
import { ContractsApi } from 'services/web3/v3/contractsApi';

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
    buildPendingRewardsCall(contract, user, position)
  );
  const res = await multicall(calls);
  if (res)
    return res.map((x, i) => ({
      id: positions[i].id,
      rewardsAmount: shrinkToken(x.toString(), 18),
    }));

  return [];
};

const buildPendingRewardsCall = (
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

export const fetchSnapshotRewards = async () => {
  try {
    const res = await axios.get<Dictionary<SnapshotRewards>>(
      '/rewards-snapshot.2022-05-13T16.25.43.632Z.min.json',
      {
        timeout: 10000,
      }
    );
    return res.data;
  } catch (e) {
    console.error('failed to fetch rewards snapshots', e);
  }
};

export const stakeSnapshotRewards = async (
  account: string,
  amount: string,
  onHash: (txHash: string) => void,
  onCompleted: Function,
  rejected: Function,
  failed: Function
) => {
  try {
    const leaf: Buffer = generateLeaf(account, amount);
    const merkleTree = new MerkleTree([leaf], keccak256, { sortPairs: true });
    const proof: string[] = merkleTree.getHexProof(leaf);

    console.log('proof', proof);
    const tx = await ContractsApi.StakingRewardsClaim.write.stakeRewards(
      account,
      amount,
      proof
    );
    onHash(tx.hash);
    await tx.wait();
    onCompleted();
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx) rejected();
    else failed();
  }
};

const generateLeaf = (address: string, value: string): Buffer => {
  return Buffer.from(
    ethers.utils
      .solidityKeccak256(['address', 'uint256'], [address, value])
      .slice(2),
    'hex'
  );
};
