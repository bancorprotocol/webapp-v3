import { createSlice } from '@reduxjs/toolkit';
import { KeeprDaoToken } from 'services/api/keeperDao';
import { TokenList, Token } from 'services/observables/tokens';

interface BancorState {
  tokenLists: TokenList[];
  tokens: Token[];
  keeperDaoTokens: KeeprDaoToken[];
}

export const initialState: BancorState = {
  tokenLists: [],
  tokens: [],
  keeperDaoTokens: [],
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
    setKeeperDaoTokens: (state, action) => {
      state.keeperDaoTokens = action.payload;
    },
  },
});

export const { setTokenLists, setTokenList, setKeeperDaoTokens } =
  bancorSlice.actions;

export const bancor = bancorSlice.reducer;
