import { createSelector, createSlice, RootState } from '@reduxjs/toolkit';
import { BigNumber } from 'bignumber.js';
import { get } from 'lodash';
import { Rewards } from 'services/observables/liquidity';
import { PoolToken } from 'services/observables/tokens';
import { LockedBnt } from 'services/web3/lockedbnt/lockedbnt';
import {
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';

interface LiquidityState {
  poolTokens: PoolToken[];
  availableBNT: number;
  lockedBNT: LockedBnt[];
  protectedPositions: ProtectedPosition[];
  rewards?: Rewards;
}

const initialState: LiquidityState = {
  poolTokens: [],
  availableBNT: 0,
  lockedBNT: [],
  protectedPositions: [],
  rewards: undefined,
};

const liquiditySlice = createSlice({
  name: 'liquidity',
  initialState,
  reducers: {
    setPoolTokens: (state, action) => {
      state.poolTokens = action.payload;
    },
    setAvailableBNT: (state, action) => {
      state.availableBNT = action.payload;
    },
    setLockedBNT: (state, action) => {
      state.lockedBNT = action.payload;
    },
    setProtectedPositions: (state, action) => {
      state.protectedPositions = action.payload;
    },
    setRewards: (state, action) => {
      state.rewards = action.payload;
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
        const id = `${poolId}-${symbol}`;
        const filtered = protectedPositions.filter(
          (pos) =>
            pos.pool.pool_dlt_id === poolId &&
            pos.reserveToken.symbol === symbol
        );

        let item: ProtectedPositionGrouped = obj.get(id);

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
            .times(bntUSDPrice)
            .div(sumInitalStakeUSD)
            .toString();

          item = {
            id,
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
                .div(sumInitalStakeTkn)
                .toString(),
            },
            aprs: val.aprs,
            timestamp: val.timestamp,
            rewardsMultiplier: val.rewardsMultiplier,
            rewardsAmount: val.rewardsAmount,
            subRows: [],
          };

          obj.set(id, item);
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

export const {
  setPoolTokens,
  setAvailableBNT,
  setLockedBNT,
  setProtectedPositions,
  setRewards,
} = liquiditySlice.actions;

export const liquidity = liquiditySlice.reducer;
