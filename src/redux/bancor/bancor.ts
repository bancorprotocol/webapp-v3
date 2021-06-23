import { createSlice } from '@reduxjs/toolkit';
import { TokenList, TokenListItem } from 'observables/tokenList';

interface BancorState {
  tokens_lists: TokenList[];
  tokens: TokenListItem[];
}

export const initialState: BancorState = {
  tokens_lists: [],
  tokens: [],
};

const bancorSlice = createSlice({
  name: 'bancor',
  initialState,
  reducers: {
    setTokenLists: (state, action) => {
      state.tokens_lists = action.payload;
    },
    setTokenList: (state, action) => {
      state.tokens_lists = action.payload;
    },
  },
});

export const { setTokenLists, setTokenList } = bancorSlice.actions;

export const bancor = bancorSlice.reducer;
