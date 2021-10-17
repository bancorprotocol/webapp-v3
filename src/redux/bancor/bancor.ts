import { createSelector, createSlice } from '@reduxjs/toolkit';
import { KeeprDaoToken } from 'services/api/keeperDao';
import { TokenList, Token } from 'services/observables/tokens';
import { RootState } from 'redux/index';

interface BancorState {
  tokenLists: TokenList[];
  tokens: Token[];
  keeperDaoTokens: KeeprDaoToken[];
  bntPrice: string | null;
}

export const initialState: BancorState = {
  tokenLists: [],
  tokens: [],
  keeperDaoTokens: [],
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

export const getTokenById = (id: string) =>
  createSelector(
    (state: RootState) => state.bancor.tokens,
    (tokens: Token[]) => {
      return tokens.find((t) => t.address === id);
    }
  );

export const {
  setTokenLists,
  setTokenList,
  setKeeperDaoTokens,
  updateTokens,
  setBntPrice,
} = bancorSlice.actions;

export const bancor = bancorSlice.reducer;
