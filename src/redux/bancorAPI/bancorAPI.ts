import { createSlice } from '@reduxjs/toolkit';
import { WelcomeData } from 'api/bancor';

export interface ViewToken {
  symbol: string;
  name: string;
  logoURI: string;
}

interface ViewPool {}

interface InitialState {
  welcomeData: WelcomeData;
  tokens: ViewToken[];
  pools: ViewPool[];
}

export const initialState: InitialState = {
  welcomeData: {
    total_liquidity: { usd: null },
    total_volume_24h: { usd: null },
    bnt_price_24h_ago: { usd: null },
    bnt_price: { usd: null },
    bnt_supply: '',
    swaps: [],
    pools: [],
    tokens: [],
  },
  tokens: [],
  pools: [],
};

const userSlice = createSlice({
  name: 'bancorAPI',
  initialState,
  reducers: {
    setWelcomeData: (bancorAPI, action) => {
      bancorAPI.welcomeData = action.payload;
    },
    setTokens: (bancorAPI, action) => {
      bancorAPI.tokens = action.payload;
    },
    setPools: (bancorAPI, action) => {
      bancorAPI.pools = action.payload;
    },
  },
});

export const { setWelcomeData, setTokens, setPools } = userSlice.actions;

export const bancorAPI = userSlice.reducer;
