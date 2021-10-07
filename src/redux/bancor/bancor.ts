import { createSlice } from '@reduxjs/toolkit';
import { KeeprDaoToken } from 'services/api/keeperDao';
import { TokenList, Token } from 'services/observables/tokens';

interface BancorState {
  tokenLists: TokenList[];
  tokens: Token[];
  keeperDaoTokens: KeeprDaoToken[];
  allTokens: Token[];
}

export const initialState: BancorState = {
  tokenLists: [],
  tokens: [],
  keeperDaoTokens: [],
  allTokens: [],
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
  },
});

export const {
  setTokenLists,
  setTokenList,
  setAllTokens,
  setKeeperDaoTokens,
  updateTokens,
} = bancorSlice.actions;

export const bancor = bancorSlice.reducer;
