import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KeeprDaoToken } from 'services/api/keeperDao';
import { Token } from 'services/observables/tokens';
import { RootState } from 'store';
import { orderBy } from 'lodash';
import { TokenList, TokenMinimal } from 'services/observables/tokens';
import { getAllTokensMap, getTokensV3Map } from 'store/bancor/token';
import { utils } from 'ethers';
import {
  RewardsProgramRaw,
  RewardsProgramV3,
} from 'services/web3/v3/portfolio/standardStaking';

interface BancorState {
  tokenLists: TokenList[];
  tokens: Token[];
  keeperDaoTokens: KeeprDaoToken[];
  allTokenListTokens: TokenMinimal[];
  allTokens: Token[];
  allStandardRewardPrograms: RewardsProgramRaw[];
  isLoadingTokens: boolean;
}

export const initialState: BancorState = {
  tokenLists: [],
  tokens: [],
  allTokens: [],
  keeperDaoTokens: [],
  allTokenListTokens: [],
  allStandardRewardPrograms: [],
  isLoadingTokens: true,
};

const bancorSlice = createSlice({
  name: 'bancor',
  initialState,
  reducers: {
    setTokens: (state, action) => {
      state.tokens = action.payload;
    },
    setAllTokens: (state, action) => {
      state.allTokens = action.payload;
      state.isLoadingTokens = false;
    },
    setTokenLists: (state, action) => {
      state.tokenLists = action.payload;
    },
    setAllTokenListTokens: (state, action) => {
      state.allTokenListTokens = action.payload;
    },
    setKeeperDaoTokens: (state, action) => {
      state.keeperDaoTokens = action.payload;
    },
    setAllStandardRewardPrograms: (
      state,
      action: PayloadAction<RewardsProgramRaw[]>
    ) => {
      state.allStandardRewardPrograms = action.payload;
    },
  },
});

export const {
  setTokens,
  setAllTokens,
  setTokenLists,
  setAllTokenListTokens,
  setKeeperDaoTokens,
  setAllStandardRewardPrograms,
} = bancorSlice.actions;

export const getTokenById = createSelector(
  (state: RootState) => getAllTokensMap(state),
  (_: any, id: string) => id,
  (allTokensMap: Map<string, Token>, id: string): Token | undefined => {
    if (!id) return undefined;
    return allTokensMap.get(utils.getAddress(id));
  }
);

export const getTopMovers = createSelector(
  (state: RootState) => state.bancor.tokens,
  (tokens: Token[]) => {
    const filtered = tokens.filter(
      (t) => t.isProtected && Number(t.liquidity ?? 0) > 100000
    );
    return orderBy(filtered, 'price_change_24', 'desc').slice(0, 20);
  }
);

export const bancor = bancorSlice.reducer;

export const getAllStandardRewardPrograms = createSelector(
  (state: RootState) => state.bancor.allStandardRewardPrograms,
  (state: RootState) => getTokensV3Map(state),
  (
    allStandardRewardPrograms: RewardsProgramRaw[],
    allTokensMap: Map<string, Token>
  ): RewardsProgramV3[] => {
    return allStandardRewardPrograms.map((program) => {
      const rewardsToken = allTokensMap.get(program.rewardsToken);
      const token = allTokensMap.get(program.pool);
      return {
        ...program,
        token,
        rewardsToken,
      };
    });
  }
);

export const getAllStandardRewardProgramsByPoolId = createSelector(
  getAllStandardRewardPrograms,
  (
    allStandardRewardPrograms: RewardsProgramV3[]
  ): Map<string, RewardsProgramV3> => {
    return allStandardRewardPrograms.reduce((acc, program) => {
      if (program.token?.address) acc.set(program.token.address, program);
      return acc;
    }, new Map());
  }
);
