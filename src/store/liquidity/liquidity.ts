import { createSelector, createSlice } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import { get } from 'lodash';
import { Rewards, SnapshotRewards } from 'services/observables/liquidity';
import { LockedAvailableBnt } from 'services/web3/lockedbnt/lockedbnt';
import {
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { PoolToken } from 'services/observables/pools';
import { RootState } from 'store';
import { bntToken } from 'services/web3/config';
import { Dictionary } from 'services/web3/types';
import MerkleTree from 'merkletreejs';
import { getAddress, keccak256 } from 'ethers/lib/utils';
import { generateLeaf } from 'services/web3/protection/rewards';

interface LiquidityState {
  poolTokens: PoolToken[];
  lockedAvailableBNT: LockedAvailableBnt;
  protectedPositions: ProtectedPosition[];
  rewards?: Rewards;
  protocolBnBNTAmount: number;
  loadingPositions: boolean;
  loadingRewards: boolean;
  loadingLockedBnt: boolean;
  snapshots?: Dictionary<SnapshotRewards>;
}

const initialState: LiquidityState = {
  poolTokens: [],
  lockedAvailableBNT: {
    locked: [],
    available: 0,
  },
  protocolBnBNTAmount: 0,
  protectedPositions: [],
  rewards: undefined,
  loadingPositions: false,
  loadingRewards: false,
  loadingLockedBnt: false,
  snapshots: undefined,
};

const liquiditySlice = createSlice({
  name: 'liquidity',
  initialState,
  reducers: {
    setPoolTokens: (state, action) => {
      state.poolTokens = action.payload;
    },
    setLockedAvailableBNT: (state, action) => {
      state.lockedAvailableBNT = action.payload;
    },
    setProtectedPositions: (state, action) => {
      state.protectedPositions = action.payload;
    },
    setRewards: (state, action) => {
      state.rewards = action.payload;
    },
    setLoadingPositions: (state, action) => {
      state.loadingPositions = action.payload;
    },
    setLoadingRewards: (state, action) => {
      state.loadingRewards = action.payload;
    },
    setLoadingLockedBnt: (state, action) => {
      state.loadingLockedBnt = action.payload;
    },
    setProtocolBnBNTAmount: (state, action) => {
      state.protocolBnBNTAmount = action.payload;
    },
    setSnapshots: (state, action) => {
      state.snapshots = action.payload;
    },
  },
});

export const getGroupedPositions = createSelector(
  (state: RootState) => state.liquidity.protectedPositions,
  (protectedPositions: ProtectedPosition[]) => {
    return protectedPositions.reduce(
      ((obj) => (acc: ProtectedPositionGrouped[], val: ProtectedPosition) => {
        const symbol = val.reserveToken.symbol;

        const bnt = val.pool.reserves[1];
        const bntUSDPrice = bnt.usdPrice
          ? new BigNumber(bnt.usdPrice)
          : new BigNumber(0);
        const poolId = val.pool.pool_dlt_id;
        const groupId = `${poolId}-${symbol}`;
        const filtered = protectedPositions.filter(
          (pos) =>
            pos.pool.pool_dlt_id === poolId &&
            pos.reserveToken.symbol === symbol
        );

        let item: ProtectedPositionGrouped = obj.get(groupId);

        if (!item) {
          const calcSum = (key: string): string => {
            return filtered
              .map((pos) => Number(get(pos, key)))
              .reduce((sum, current) => sum + current, 0)
              .toString();
          };

          const sumFees = calcSum('fees');
          const sumInitalStakeTkn = calcSum('initialStake.tknAmount');
          const sumInitalStakeUSD = calcSum('initialStake.usdAmount');

          const sumRoi = new BigNumber(sumFees)
            .div(sumInitalStakeTkn)
            .toString();

          item = {
            groupId: groupId,
            positionId: val.positionId,
            pool: val.pool,
            fees: sumFees,
            initialStake: {
              usdAmount: sumInitalStakeUSD,
              tknAmount: sumInitalStakeTkn,
            },
            protectedAmount: {
              usdAmount: calcSum('protectedAmount.usdAmount'),
              tknAmount: calcSum('protectedAmount.tknAmount'),
            },
            claimableAmount: {
              usdAmount: calcSum('claimableAmount.usdAmount'),
              tknAmount: calcSum('claimableAmount.tknAmount'),
            },
            reserveToken: val.reserveToken,
            roi: {
              fees: sumRoi,
              reserveRewards: new BigNumber(val.rewardsAmount)
                .times(bntUSDPrice)
                .div(sumInitalStakeUSD)
                .toString(),
            },
            aprs: val.aprs,
            timestamps: val.timestamps,
            currentCoveragePercent: val.currentCoveragePercent,
            rewardsMultiplier: val.rewardsMultiplier,
            rewardsAmount: val.rewardsAmount,
            vaultBalance: val.vaultBalance,
            subRows: [],
          };

          obj.set(groupId, item);
          acc.push(item);
        }

        if (filtered.length > 1) {
          item.subRows.push(val);
        }
        return acc;
      })(new Map()),
      []
    );
  }
);

export const getAllBntPositionsAndAmount = createSelector(
  (state: RootState) => state.liquidity.protectedPositions,
  (protectedPositions: ProtectedPosition[]) => {
    const bntPositions = protectedPositions.filter(
      (pos) => pos.reserveToken.address === bntToken
    );

    const tknAmount = bntPositions
      .map((x) => Number(x.protectedAmount.tknAmount))
      .reduce((sum, current) => sum + current, 0);
    const usdAmount = bntPositions
      .map((x) => Number(x.protectedAmount.usdAmount))
      .reduce((sum, current) => sum + current, 0);

    return { tknAmount, usdAmount, bntPositions };
  }
);

export const getPositionById = (id: string): any =>
  createSelector(
    getGroupedPositions,
    (positions: ProtectedPositionGrouped[]) => {
      return positions.find((pos) => pos.groupId === id);
    }
  );

export interface MyStakeSummary {
  protectedValue: number;
  claimableValue: number;
  fees: number;
}

export const getStakeSummary = createSelector(
  (state: RootState) => state.liquidity.protectedPositions,
  (protectedPositions: ProtectedPosition[]) => {
    if (protectedPositions.length === 0) return;

    const initialStake = protectedPositions
      .map((x) => Number(x.initialStake.usdAmount))
      .reduce((sum, current) => sum + current, 0);

    const protectedValue = protectedPositions
      .map((x) => Number(x.protectedAmount.usdAmount))
      .reduce((sum, current) => sum + current, 0);

    const claimableValue = protectedPositions
      .map((x) => Number(x.claimableAmount.usdAmount))
      .reduce((sum, current) => sum + current, 0);

    const fees = protectedValue - initialStake;

    return {
      protectedValue,
      claimableValue,
      fees,
    };
  }
);

export const getUserRewardsFromSnapshot = createSelector(
  (state: RootState) => state.user.account,
  (state: RootState) => state.liquidity.snapshots,
  (
    account: string | null | undefined,
    snapshots?: Dictionary<SnapshotRewards>
  ) => {
    const empty = { claimable: '0', totalClaimed: '0' };
    if (account && snapshots) {
      if (snapshots[account]) {
        return snapshots[account];
      }
      // fallback to key not found due to casing
      const accAddress = getAddress(account);
      const entry = Object.entries(snapshots).find(
        ([address]) => getAddress(address) === accAddress
      );
      return entry ? entry[1] : empty;
    }

    return empty;
  }
);

export const getMerkleTree = createSelector(
  (state: RootState) => state.liquidity.snapshots,
  (snapshots?: Dictionary<SnapshotRewards>) => {
    if (!snapshots) return null;
    return new MerkleTree(
      // Generate leafs
      Object.entries(snapshots).map(([address, { claimable }]) =>
        generateLeaf(address, claimable)
      ),
      keccak256,
      { sortPairs: true }
    );
  }
);

export const getUserRewardsProof = createSelector(
  (state: RootState) => state.user.account,
  getUserRewardsFromSnapshot,
  getMerkleTree,
  (account: string | null | undefined, userRewards, tree) => {
    if (!account || !tree || userRewards.claimable === '0') return null;
    const { claimable } = userRewards;
    const leaf: Buffer = generateLeaf(account, claimable);
    const proof: string[] = tree.getHexProof(leaf);
    return proof;
  }
);

export const {
  setPoolTokens,
  setLockedAvailableBNT,
  setProtectedPositions,
  setRewards,
  setLoadingPositions,
  setLoadingRewards,
  setLoadingLockedBnt,
  setProtocolBnBNTAmount,
  setSnapshots,
} = liquiditySlice.actions;

export const liquidity = liquiditySlice.reducer;
