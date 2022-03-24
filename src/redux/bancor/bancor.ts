import { createSelector, createSlice } from '@reduxjs/toolkit';
import { KeeprDaoToken } from 'services/api/keeperDao';
import { Token } from 'services/observables/tokens';
import { RootState } from 'redux/index';
import { orderBy } from 'lodash';
import { TokenList, TokenMinimal } from 'services/observables/v3/tokens';
import { getAllTokensMap } from 'redux/bancor/token';
import { utils } from 'ethers';

interface BancorState {
  tokenLists: TokenList[];
  tokens: Token[];
  keeperDaoTokens: KeeprDaoToken[];
  allTokenListTokens: TokenMinimal[];
  allTokens: Token[];
}

export const initialState: BancorState = {
  tokenLists: [],
  tokens: [],
  allTokens: [],
  keeperDaoTokens: [],
  allTokenListTokens: [],
};

const bancorSlice = createSlice({
  name: 'bancor',
  initialState,
  reducers: {
    setTokens: (state, action) => {
      state.tokens = action.payload;
    },
    setAllTokens: (state, action) => {
      state.allTokens = action.payload;
    },
    setTokenLists: (state, action) => {
      state.tokenLists = action.payload;
    },
    setAllTokenListTokens: (state, action) => {
      state.allTokenListTokens = action.payload;
    },
    setKeeperDaoTokens: (state, action) => {
      state.keeperDaoTokens = action.payload;
    },
  },
});

export const {
  setTokens,
  setAllTokens,
  setTokenLists,
  setAllTokenListTokens,
  setKeeperDaoTokens,
} = bancorSlice.actions;

export const getTokenById = createSelector(
  (state: RootState) => getAllTokensMap(state),
  (_: any, id: string) => id,
  (allTokensMap: Map<string, Token>, id: string) => {
    return allTokensMap.get(utils.getAddress(id));
  }
);

export const getTopMovers = createSelector(
  (state: RootState) => state.bancor.tokens,
  (tokens: Token[]) => {
    const filtered = tokens.filter(
      (t) => t.isProtected && Number(t.liquidity ?? 0) > 100000
    );
    return orderBy(filtered, 'price_change_24', 'desc').slice(0, 20);
  }
);

export const bancor = bancorSlice.reducer;
