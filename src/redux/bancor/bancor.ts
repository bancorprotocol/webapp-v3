import { createSlice } from '@reduxjs/toolkit';
import { TokenList } from 'api/keeperDao';

interface BancorState {
  tokens_lists: TokenList[];
}

export const initialState: BancorState = {
  tokens_lists: [],
};

const bancorSlice = createSlice({
  name: 'bancor',
  initialState,
  reducers: {
    setTokenLists: (state, action) => {
      state.tokens_lists = action.payload;
    },
  },
});

export const { setTokenLists } = bancorSlice.actions;

export const bancor = bancorSlice.reducer;
