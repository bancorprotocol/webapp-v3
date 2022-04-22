import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Holding,
  HoldingRaw,
  mockBonuses,
  V3PortfolioState,
  WithdrawalRequest,
  WithdrawalRequestRaw,
  WithdrawalSettings,
} from 'store/portfolio/v3Portfolio.types';
import { RootState } from 'store/index';
import { getAllTokensMap } from 'store/bancor/token';
import { Token } from 'services/observables/tokens';
import { utils } from 'ethers';
import { RewardsProgramStake } from 'services/web3/v3/portfolio/standardStaking';
import BigNumber from 'bignumber.js';
import { uniqBy } from 'lodash';

export const initialState: V3PortfolioState = {
  holdingsRaw: [],
  isLoadingHoldings: true,
  withdrawalRequestsRaw: [],
  withdrawalSettings: { lockDuration: 0, withdrawalFee: 0 },
  isLoadingWithdrawalRequests: true,
  bonusesModal: false,
  bonuses: mockBonuses,
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
  (state: RootState) => state.bancor.isLoadingTokens,
  (state: RootState) => state.v3Portfolio.isLoadingHoldings,
  (state: RootState) => state.v3Portfolio.isLoadingStandardRewards,
  (isLoadingTokens, isLoadingHoldings, isLoadingStandardRewards): boolean => {
    return isLoadingTokens || isLoadingHoldings || isLoadingStandardRewards;
  }
);

export const getPortfolioHoldings = createSelector(
  (state: RootState) => state.v3Portfolio.holdingsRaw,
  (state: RootState) => state.v3Portfolio.standardRewards,
  (state: RootState) => getAllTokensMap(state),
  (
    holdingsRaw: HoldingRaw[],
    standardRewards: RewardsProgramStake[],
    allTokensMap: Map<string, Token>
  ): Holding[] => {
    const standardRewardsMap = new Map(
      standardRewards.map((reward) => [reward.pool, reward])
    );

    const holdingsRawMap = new Map(
      holdingsRaw.map((holding) => [holding.poolId, holding])
    );

    const buildHoldingObject = (poolId: string) => {
      const standardStakingReward = standardRewardsMap.get(poolId);
      const holdingRaw = holdingsRawMap.get(poolId);
      const poolTokenId =
        holdingRaw?.poolTokenId || standardStakingReward?.poolToken;
      if (!poolTokenId) {
        console.error('buildHoldingObject: poolTokenId is undefined');
        return undefined;
      }
      const token = allTokensMap.get(poolId);
      if (!token) {
        return undefined;
      }

      const poolTokenBalance = utils.formatUnits(
        holdingRaw?.poolTokenBalanceWei || '0',
        18
      );
      const tokenBalance = utils.formatUnits(
        holdingRaw?.tokenBalanceWei || '0',
        token.decimals
      );

      const stakedTokenBalance = utils.formatUnits(
        standardStakingReward?.tokenAmountWei || '0',
        token.decimals
      );

      const combinedTokenBalance = new BigNumber(tokenBalance)
        .plus(stakedTokenBalance)
        .toString();

      const holding: Holding = {
        token,
        poolId,
        poolTokenId,
        poolTokenBalance,
        tokenBalance,
        standardStakingReward,
        combinedTokenBalance,
      };

      return holding;
    };

    const allHoldingPools = holdingsRaw.map((holding) => holding.poolId);
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
  (state: RootState) => state.bancor.isLoadingTokens,
  (state: RootState) => state.v3Portfolio.isLoadingWithdrawalRequests,
  (isLoadingTokens, isLoadingWithdrawalRequests): boolean => {
    return isLoadingTokens || isLoadingWithdrawalRequests;
  }
);

export const getPortfolioWithdrawalRequests = createSelector(
  (state: RootState) => state.v3Portfolio.withdrawalRequestsRaw,
  (state: RootState) => state.v3Portfolio.withdrawalSettings,
  (state: RootState) => getAllTokensMap(state),
  (
    withdrawalRequestsRaw: WithdrawalRequestRaw[],
    withdrawalSettings: WithdrawalSettings,
    allTokensMap: Map<string, Token>
  ): WithdrawalRequest[] => {
    return withdrawalRequestsRaw
      .map((requestRaw) => {
        const token = allTokensMap.get(requestRaw.reserveToken);
        if (!token) {
          return undefined;
        }

        const lockEndsAt =
          requestRaw.createdAt + withdrawalSettings.lockDuration;
        const poolTokenAmount = utils.formatUnits(
          requestRaw.poolTokenAmountWei,
          token.decimals
        );
        const reserveTokenAmount = utils.formatUnits(
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
  }
);

export interface StandardReward extends RewardsProgramStake {
  programToken: Token;
}

export interface GroupedStandardReward {
  groupId: string;
  groupToken: Token;
  totalPendingRewards: string;
  rewards: StandardReward[];
}

export const getStandardRewards = createSelector(
  (state: RootState) => state.v3Portfolio.standardRewards,
  (state: RootState) => getAllTokensMap(state),
  (
    standardRewards: RewardsProgramStake[],
    allTokensMap: Map<string, Token>
  ): GroupedStandardReward[] => {
    if (allTokensMap.size === 0) {
      return [];
    }
    return standardRewards.reduce(
      ((obj) => (acc: GroupedStandardReward[], val: RewardsProgramStake) => {
        const groupId = utils.getAddress(val.rewardsToken);
        const filtered = standardRewards.filter(
          (reward) => reward.rewardsToken === groupId
        );
        const groupToken = allTokensMap.get(groupId);
        if (!groupToken) {
          console.error(
            `Failed GroupedStandardReward: No token found for ${groupId}`
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
            groupToken,
            totalPendingRewards,
            rewards: [],
          };

          obj.set(groupId, item);
          acc.push(item);
        }

        const programToken = allTokensMap.get(val.pool);

        if (!programToken) {
          console.error(
            `Failed GroupedStandardReward: No programToken found for ${programToken}`
          );
          return acc;
        }

        item.rewards.push({ ...val, programToken });
        return acc;
      })(new Map()),
      []
    );
  }
);
