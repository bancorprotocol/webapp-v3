import { createSlice } from '@reduxjs/toolkit';
import { TokenList, Token } from 'services/observables/tokens';

interface BancorState {
  tokenLists: TokenList[];
  tokens: Token[];
}

export const initialState: BancorState = {
  tokenLists: [],
  tokens: [],
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
  },
});

export const { setTokenLists, setTokenList } = bancorSlice.actions;

export const bancor = bancorSlice.reducer;
