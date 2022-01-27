import { createSelector, createSlice } from '@reduxjs/toolkit';
import { KeeprDaoToken } from 'services/api/keeperDao';
import { TokenList, Token } from 'services/observables/tokens';
import { RootState } from 'redux/index';
import { orderBy } from 'lodash';
import { APIToken } from 'services/api/bancor';
import { getTokenWithoutImage } from 'services/web3/config';

interface BancorState {
  tokenLists: TokenList[];
  tokens: Token[];
  keeperDaoTokens: KeeprDaoToken[];
  allTokens: Token[];
  apiTokens: APIToken[];
  bntPrice: string | null;
}

export const initialState: BancorState = {
  tokenLists: [],
  tokens: [],
  keeperDaoTokens: [],
  apiTokens: [],
  allTokens: [],
  bntPrice: null,
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
    setAllTokens: (state, action) => {
      state.allTokens = action.payload;
    },
    setApiTokens: (state, action) => {
      state.apiTokens = action.payload;
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
    setBntPrice: (state, action) => {
      state.bntPrice = action.payload;
    },
  },
});

export const {
  setTokenLists,
  setTokenList,
  setAllTokens,
  setApiTokens,
  setKeeperDaoTokens,
  updateTokens,
  setBntPrice,
} = bancorSlice.actions;

const tokens = (state: RootState) => state.bancor.tokens;
const apiTokens = (state: RootState) => state.bancor.apiTokens;

export const getTokenById = createSelector(
  tokens,
  apiTokens,
  (_: any, id: string) => id,
  (tokens: Token[], apiTokens: APIToken[], id) => {
    const token = tokens.find((t) => t.address === id);
    if (token) return token;

    const apiToken = apiTokens.find((t) => t.dlt_id === id);
    if (apiToken) return getTokenWithoutImage(apiToken);
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
