import { createSlice } from '@reduxjs/toolkit';
import { Token } from 'services/observables/tokens';
import { mockToken } from 'utils/mocked';
import { uniqueId } from 'lodash';
const mockBonuses: Bonus[] = [
  {
    id: uniqueId(),
    token: mockToken,
    claimable: [
      { id: uniqueId(), token: mockToken, amount: '123.123' },
      { id: uniqueId(), token: mockToken, amount: '123.123' },
    ],
  },
  {
    id: uniqueId(),
    token: mockToken,
    claimable: [
      { id: uniqueId(), token: mockToken, amount: '123.123' },
      { id: uniqueId(), token: mockToken, amount: '123.123' },
    ],
  },
];

export interface BonusClaimable {
  id: string;
  token: Token;
  amount: string;
}

export interface Bonus {
  id: string;
  token: Token;
  claimable: BonusClaimable[];
}

interface V3PortfolioState {
  bonusesModal: boolean;
  bonuses: Bonus[];
}

export const initialState: V3PortfolioState = {
  bonusesModal: false,
  bonuses: mockBonuses,
};

const v3PortfolioSlice = createSlice({
  name: 'v3Portfolio',
  initialState,
  reducers: {
    openBonusesModal: (state, action) => {
      state.bonusesModal = action.payload;
    },
  },
});

export const { openBonusesModal } = v3PortfolioSlice.actions;

export const v3Portfolio = v3PortfolioSlice.reducer;
