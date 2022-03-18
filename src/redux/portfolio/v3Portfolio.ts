import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  mockBonuses,
  ProviderStake,
  RewardsEarning,
  RewardsProgram,
  V3PortfolioState,
} from 'redux/portfolio/v3Portfolio.types';
import { RootState } from 'redux/index';

export const initialState: V3PortfolioState = {
  allRewardsPrograms: [],
  providerProgramStakes: [],
  bonusesModal: false,
  bonuses: mockBonuses,
};

const v3PortfolioSlice = createSlice({
  name: 'v3Portfolio',
  initialState,
  reducers: {
    setAllRewardsPrograms: (state, action: PayloadAction<RewardsProgram[]>) => {
      state.allRewardsPrograms = action.payload;
    },
    setProviderProgramStakes: (
      state,
      action: PayloadAction<ProviderStake[]>
    ) => {
      state.providerProgramStakes = action.payload;
    },
    openBonusesModal: (state, action: PayloadAction<boolean>) => {
      state.bonusesModal = action.payload;
    },
  },
});

export const {
  setAllRewardsPrograms,
  setProviderProgramStakes,
  openBonusesModal,
} = v3PortfolioSlice.actions;

export const v3Portfolio = v3PortfolioSlice.reducer;

const allPrograms = (state: RootState) => state.v3Portfolio.allRewardsPrograms;
const providerStake = (state: RootState) =>
  state.v3Portfolio.providerProgramStakes;

export const getRewardsEarnings = createSelector(
  allPrograms,
  providerStake,
  (
    allPrograms: RewardsProgram[],
    providerStakes: ProviderStake[]
  ): RewardsEarning[] => {
    const allProgramsMap = new Map(
      allPrograms.map((program) => [program.id, program])
    );
    return providerStakes
      .map(({ programId, amount }) => {
        const program = allProgramsMap.get(programId);
        if (!program) {
          return null;
        }
        return {
          programId,
          amount,
          program,
        } as RewardsEarning;
      })
      .filter((earning) => !!earning) as RewardsEarning[];
  }
);
