import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Holding,
  HoldingRaw,
  mockBonuses,
  V3PortfolioState,
} from 'redux/portfolio/v3Portfolio.types';
import { RootState } from 'redux/index';
import { getAllTokensMap } from 'redux/bancor/token';
import { Token } from 'services/observables/tokens';
import { mockToken } from 'utils/mocked';
import { utils } from 'ethers';

export const initialState: V3PortfolioState = {
  holdingsRaw: [],
  bonusesModal: false,
  bonuses: mockBonuses,
};

const v3PortfolioSlice = createSlice({
  name: 'v3Portfolio',
  initialState,
  reducers: {
    setHoldingsRaw: (state, action: PayloadAction<HoldingRaw[]>) => {
      state.holdingsRaw = action.payload;
    },
    openBonusesModal: (state, action: PayloadAction<boolean>) => {
      state.bonusesModal = action.payload;
    },
  },
});

export const { setHoldingsRaw, openBonusesModal } = v3PortfolioSlice.actions;

export const v3Portfolio = v3PortfolioSlice.reducer;

export const getPortfolioHoldings = createSelector(
  (state: RootState) => state.v3Portfolio.holdingsRaw,
  (state: RootState) => getAllTokensMap(state),
  (holdingsRaw: HoldingRaw[], allTokensMap: Map<string, Token>): Holding[] => {
    return holdingsRaw.map((holdingRaw) => {
      const token = allTokensMap.get(holdingRaw.poolId) ?? mockToken;
      if (!token) {
        // TODO: remove mockToken after API data available
      }
      const holding: Holding = {
        poolId: holdingRaw.poolId,
        poolTokenId: holdingRaw.poolTokenId,
        poolTokenBalance: utils.formatUnits(
          holdingRaw.poolTokenBalanceWei,
          token.decimals
        ),
        tokenBalance: utils.formatUnits(
          holdingRaw.tokenBalanceWei,
          token.decimals
        ),
        token: token,
      };
      return holding;
    });
  }
);
