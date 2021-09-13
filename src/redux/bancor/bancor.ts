import { createSlice } from '@reduxjs/toolkit';
import { KeeprDaoToken } from 'services/api/keeperDao';
import { TokenList, Token, Pool } from 'services/observables/tokens';
import { Statistic } from 'services/observables/statistics';

interface BancorState {
  tokenLists: TokenList[];
  tokens: Token[];
  keeperDaoTokens: KeeprDaoToken[];
  pools: Pool[];
  statistics: Statistic[];
}

export const initialState: BancorState = {
  tokenLists: [],
  tokens: [],
  keeperDaoTokens: [],
  pools: [],
  statistics: [],
};

const bancorSlice = createSlice({
  name: 'bancor',
  initialState,
  reducers: {
    setTokenLists: (state, action) => {
      state.tokenLists = action.payload;
    },
    setTokenList: (state, action) => {
      state.tokens = action.payload;
    },
    updateTokens: (state, action) => {
      const tokenToUpdate = action.payload as Token[];
      state.tokens = state.tokens.map(
        (token) =>
          tokenToUpdate.find(
            (updatedToken) => updatedToken.address === token.address
          ) || token
      );
    },
    setKeeperDaoTokens: (state, action) => {
      state.keeperDaoTokens = action.payload;
    },
    setPools: (state, action) => {
      state.pools = action.payload;
    },
    setStats: (state, action) => {
      state.statistics = action.payload;
    },
  },
});

export const {
  setTokenLists,
  setTokenList,
  setKeeperDaoTokens,
  updateTokens,
  setPools,
  setStats,
} = bancorSlice.actions;

export const bancor = bancorSlice.reducer;
