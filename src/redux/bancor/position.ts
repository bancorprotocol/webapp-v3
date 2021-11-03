import { createSelector, createSlice } from '@reduxjs/toolkit';
import {
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { RootState } from 'redux/index';
import get from 'lodash/get';
import BigNumber from 'bignumber.js';

interface PositionState {
  positions: ProtectedPosition[];
}

export const initialState: PositionState = {
  positions: [],
};

const positionSlice = createSlice({
  name: 'position',
  initialState,
  reducers: {
    setPositions: (state, action) => {
      state.positions = action.payload;
    },
  },
});

export const getGroupedPositions = createSelector(
  (state: RootState) => state.position.positions,
  (positions: ProtectedPosition[]) => {
    return positions.reduce(
      ((obj) => (acc: ProtectedPositionGrouped[], val: ProtectedPosition) => {
        const symbol = val.reserveToken.symbol;
        const poolId = val.pool.pool_dlt_id;
        const id = `${poolId}-${symbol}`;
        const filtered = positions.filter(
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
          const sumRoi = new BigNumber(sumFees)
            .div(sumInitalStakeTkn)
            .toString();

          item = {
            id,
            pool: val.pool,
            fees: sumFees,
            initialStake: {
              usdAmount: calcSum('initialStake.usdAmount'),
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
            roi: sumRoi,
            aprs: val.aprs,
            timestamp: val.timestamp,
            rewardsMultiplier: val.rewardsMultiplier,
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

export const { setPositions } = positionSlice.actions;

export const position = positionSlice.reducer;
