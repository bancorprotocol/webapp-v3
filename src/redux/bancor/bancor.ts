import { createSlice } from '@reduxjs/toolkit';
import { Pool } from 'services/api/bancor';
import { KeeprDaoToken } from 'services/api/keeperDao';
import { TokenList, Token } from 'services/observables/tokens';

interface BancorState {
  tokenLists: TokenList[];
  tokens: Token[];
  pools: Pool[];
  keeperDaoTokens: KeeprDaoToken[];
}

export const initialState: BancorState = {
  tokenLists: [],
  tokens: [],
  keeperDaoTokens: [],
  pools: [],
};

const bancorSlice = createSlice({
  name: 'bancor',
  initialState,
  reducers: {
    setTokenLists: (state, action) => {
      state.tokenLists = action.payload;
    },
    setPools: (state, action) => {
      state.pools = action.payload;
    },
    setTokenList: (state, action) => {
      console.log('setTokenList called');
      state.tokens = action.payload;
    },
    setKeeperDaoTokens: (state, action) => {
      state.keeperDaoTokens = action.payload;
    },
  },
});

export const { setTokenLists, setTokenList, setKeeperDaoTokens, setPools } =
  bancorSlice.actions;

export const bancor = bancorSlice.reducer;
