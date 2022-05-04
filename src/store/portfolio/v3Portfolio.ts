import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Holding,
  HoldingRaw,
  V3PortfolioState,
  WithdrawalRequest,
  WithdrawalRequestRaw,
  WithdrawalSettings,
} from 'store/portfolio/v3Portfolio.types';
import { RootState } from 'store';
import { utils } from 'ethers';
import { RewardsProgramStake } from 'services/web3/v3/portfolio/standardStaking';
import BigNumber from 'bignumber.js';
import { orderBy, uniqBy } from 'lodash';
import { getPoolsV3Map } from 'store/bancor/pool';
import { PoolV3 } from 'services/observables/pools';
import { shrinkToken } from 'utils/formulas';

export const initialState: V3PortfolioState = {
  holdingsRaw: [],
  isLoadingHoldings: true,
  withdrawalRequestsRaw: [],
  withdrawalSettings: { lockDuration: 0, withdrawalFee: 0 },
  isLoadingWithdrawalRequests: true,
  bonusesModal: false,
  standardRewards: [],
  isLoadingStandardRewards: true,
};

const v3PortfolioSlice = createSlice({
  name: 'v3Portfolio',
  initialState,
  reducers: {
    setHoldingsRaw: (state, action: PayloadAction<HoldingRaw[]>) => {
      state.holdingsRaw = action.payload;
      state.isLoadingHoldings = false;
    },
    setWithdrawalRequestsRaw: (
      state,
      action: PayloadAction<WithdrawalRequestRaw[]>
    ) => {
      state.withdrawalRequestsRaw = action.payload;
      state.isLoadingWithdrawalRequests = false;
    },
    setWithdrawalSettings: (
      state,
      action: PayloadAction<WithdrawalSettings>
    ) => {
      state.withdrawalSettings = action.payload;
    },
    openBonusesModal: (state, action: PayloadAction<boolean>) => {
      state.bonusesModal = action.payload;
    },
    setStandardRewards: (
      state,
      action: PayloadAction<RewardsProgramStake[]>
    ) => {
      state.standardRewards = action.payload;
      state.isLoadingStandardRewards = false;
    },
  },
});

export const {
  setHoldingsRaw,
  openBonusesModal,
  setWithdrawalRequestsRaw,
  setWithdrawalSettings,
  setStandardRewards,
} = v3PortfolioSlice.actions;

export const v3Portfolio = v3PortfolioSlice.reducer;

export const getIsLoadingHoldings = createSelector(
  (state: RootState) => state.pool.isLoadingV3Pools,
  (state: RootState) => state.v3Portfolio.isLoadingHoldings,
  (state: RootState) => state.v3Portfolio.isLoadingStandardRewards,
  (isLoadingV3Pools, isLoadingHoldings, isLoadingStandardRewards): boolean => {
    return isLoadingV3Pools || isLoadingHoldings || isLoadingStandardRewards;
  }
);

export const getPortfolioHoldings = createSelector(
  (state: RootState) => state.v3Portfolio.holdingsRaw,
  (state: RootState) => state.v3Portfolio.standardRewards,
  (state: RootState) => getPoolsV3Map(state),
  (
    holdingsRaw: HoldingRaw[],
    standardRewards: RewardsProgramStake[],
    allPoolsV3Map: Map<string, PoolV3>
  ): Holding[] => {
    const standardRewardsMap = new Map(
      standardRewards.map((reward) => [reward.pool, reward])
    );

    const holdingsRawMap = new Map(
      holdingsRaw.map((holding) => [holding.poolDltId, holding])
    );

    const buildHoldingObject = (poolId: string) => {
      const standardStakingReward = standardRewardsMap.get(poolId);
      const holdingRaw = holdingsRawMap.get(poolId);

      const pool = allPoolsV3Map.get(poolId);
      if (!pool) {
        return undefined;
      }

      const poolTokenBalance = shrinkToken(
        holdingRaw?.poolTokenBalanceWei || '0',
        18
      );
      const tokenBalance = shrinkToken(
        holdingRaw?.tokenBalanceWei || '0',
        pool.decimals
      );

      const stakedTokenBalance = shrinkToken(
        standardStakingReward?.tokenAmountWei || '0',
        pool.decimals
      );

      const combinedTokenBalance = new BigNumber(tokenBalance)
        .plus(stakedTokenBalance)
        .toString();

      const holding: Holding = {
        pool,
        poolTokenBalance,
        tokenBalance,
        standardStakingReward,
        combinedTokenBalance,
      };

      return holding;
    };

    const allHoldingPools = holdingsRaw.map((holding) => holding.poolDltId);
    const allStakedPools = standardRewards.map((reward) => reward.pool);
    const allPoolsUniq = uniqBy(
      [...allHoldingPools, ...allStakedPools],
      (poolId) => poolId
    );

    return allPoolsUniq
      .map((pool) => buildHoldingObject(pool))
      .filter((holding) => holding !== undefined)
      .filter((holding) =>
        new BigNumber(holding!.combinedTokenBalance).gt(0)
      ) as Holding[];
  }
);

export const getIsLoadingWithdrawalRequests = createSelector(
  (state: RootState) => state.pool.isLoadingV3Pools,
  (state: RootState) => state.v3Portfolio.isLoadingWithdrawalRequests,
  (isLoadingV3Pools, isLoadingWithdrawalRequests): boolean => {
    return isLoadingV3Pools || isLoadingWithdrawalRequests;
  }
);

export const getPortfolioWithdrawalRequests = createSelector(
  (state: RootState) => state.v3Portfolio.withdrawalRequestsRaw,
  (state: RootState) => state.v3Portfolio.withdrawalSettings,
  (state: RootState) => getPoolsV3Map(state),
  (
    withdrawalRequestsRaw: WithdrawalRequestRaw[],
    withdrawalSettings: WithdrawalSettings,
    allPoolsMap: Map<string, PoolV3>
  ): WithdrawalRequest[] => {
    const withdrawalRequests = withdrawalRequestsRaw
      .map((requestRaw) => {
        const token = allPoolsMap.get(requestRaw.reserveToken)?.reserveToken;
        if (!token) {
          return undefined;
        }

        const lockEndsAt =
          requestRaw.createdAt + withdrawalSettings.lockDuration;
        const poolTokenAmount = shrinkToken(
          requestRaw.poolTokenAmountWei,
          token.decimals
        );
        const reserveTokenAmount = shrinkToken(
          requestRaw.reserveTokenAmountWei,
          token.decimals
        );

        const request: WithdrawalRequest = {
          ...requestRaw,
          lockEndsAt,
          poolTokenAmount,
          reserveTokenAmount,
          token,
        };

        return request;
      })
      .filter((request) => request !== undefined) as WithdrawalRequest[];

    return orderBy(withdrawalRequests, (request) => request.createdAt, 'asc');
  }
);

export interface StandardReward extends RewardsProgramStake {
  programPool: PoolV3;
}

export interface GroupedStandardReward {
  groupId: string;
  groupPool: PoolV3;
  totalPendingRewards: string;
  rewards: StandardReward[];
}

export const getIsLoadingStandardRewards = createSelector(
  (state: RootState) => state.pool.isLoadingV3Pools,
  (state: RootState) => state.v3Portfolio.isLoadingStandardRewards,
  (isLoadingV3Pools, isLoadingStandardRewards): boolean => {
    return isLoadingV3Pools || isLoadingStandardRewards;
  }
);

export const getStandardRewards = createSelector(
  (state: RootState) => state.v3Portfolio.standardRewards,
  (state: RootState) => getPoolsV3Map(state),
  (
    standardRewards: RewardsProgramStake[],
    allPoolsMap: Map<string, PoolV3>
  ): GroupedStandardReward[] => {
    if (allPoolsMap.size === 0) {
      return [];
    }
    return standardRewards.reduce(
      ((obj) => (acc: GroupedStandardReward[], val: RewardsProgramStake) => {
        const groupId = utils.getAddress(val.rewardsToken);
        const filtered = standardRewards.filter(
          (reward) => reward.rewardsToken === groupId
        );
        const groupPool = allPoolsMap.get(groupId);
        if (!groupPool) {
          console.error(
            `Failed GroupedStandardReward: No Pool found for ${groupId}`
          );
          return acc;
        }

        let item: GroupedStandardReward = obj.get(groupId);

        if (!item) {
          const totalPendingRewards = filtered
            .map((reward) => reward.pendingRewardsWei)
            .reduce(
              (sum, current) => new BigNumber(sum).plus(current).toString(),
              '0'
            );

          item = {
            groupId,
            groupPool,
            totalPendingRewards,
            rewards: [],
          };

          obj.set(groupId, item);
          acc.push(item);
        }

        const programPool = allPoolsMap.get(val.pool);

        if (!programPool) {
          console.error(
            `Failed GroupedStandardReward: No pool found for ${programPool}`
          );
          return acc;
        }

        item.rewards.push({ ...val, programPool });
        return acc;
      })(new Map()),
      []
    );
  }
);
