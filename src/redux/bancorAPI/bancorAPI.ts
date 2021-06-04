import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getWelcomeData, WelcomeData } from 'api/bancor';

export const initialState: { welcomeData: WelcomeData } = {
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
};

export const fetchWelcomeData = createAsyncThunk(
  'bancorAPI/fetchWelcomeData',
  async () => {
    return await getWelcomeData();
  }
);

const userSlice = createSlice({
  name: 'bancorAPI',
  initialState,
  reducers: {
    setWelcomeData: (bancorAPI, action) => {
      bancorAPI.welcomeData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchWelcomeData.fulfilled, (state, action) => {
      state.welcomeData = action.payload;
    });
  },
});

export const { setWelcomeData } = userSlice.actions;

export const bancorAPI = userSlice.reducer;
