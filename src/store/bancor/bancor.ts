import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KeeprDaoToken } from 'services/api/keeperDao';
import { Token, TokenList, TokenMinimal } from 'services/observables/tokens';
import { RootState } from 'store';
import { orderBy, uniqBy } from 'lodash';
import {
  getAllTokensV2Map,
  getTokensV2V3Map,
  getTokensV3Map,
} from 'store/bancor/token';
import { utils } from 'ethers';

import { Statistic } from 'services/observables/statistics';
import { NotificationType } from 'store/notification/notification';
import { RewardsProgramRaw } from 'services/web3/v3/portfolio/standardStaking';

interface BancorState {
  tokenLists: TokenList[];
  tokensV2: Token[];
  tokensV3: Token[];
  keeperDaoTokens: KeeprDaoToken[];
  allTokenListTokens: TokenMinimal[];
  tokensForTradeWithExternal: TokenMinimal[];
  allTokensV2: Token[];
  isLoadingTokens: boolean;
  statistics: Statistic | null;
  allStandardRewardsV3: RewardsProgramRaw[];
}

export const initialState: BancorState = {
  tokenLists: [],
  tokensV2: [],
  tokensV3: [],
  allTokensV2: [],
  keeperDaoTokens: [],
  allTokenListTokens: [],
  tokensForTradeWithExternal: [],
  isLoadingTokens: true,
  statistics: null,
  allStandardRewardsV3: [],
};

const bancorSlice = createSlice({
  name: 'bancor',
  initialState,
  reducers: {
    setTokensV2: (state, action) => {
      state.tokensV2 = action.payload;
    },
    setTokensV3: (state, action) => {
      state.tokensV3 = action.payload;
    },
    setAllTokensV2: (state, action) => {
      state.allTokensV2 = action.payload;
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
    setStatisticsV3: (state, action: PayloadAction<Statistic>) => {
      state.statistics = action.payload;
    },
    setAllStandardRewardsV3: (
      state,
      action: PayloadAction<RewardsProgramRaw[]>
    ) => {
      state.allStandardRewardsV3 = action.payload;
    },
    setTradeTokens: (state, action: PayloadAction<TokenMinimal[]>) => {
      state.tokensForTradeWithExternal = action.payload;
    },
  },
});

export const {
  setTokensV2,
  setTokensV3,
  setTokenLists,
  setAllTokensV2,
  setStatisticsV3,
  setAllTokenListTokens,
  setKeeperDaoTokens,
  setAllStandardRewardsV3,
  setTradeTokens,
} = bancorSlice.actions;

export const getTokenV2ById = createSelector(
  (state: RootState) => getAllTokensV2Map(state),
  (_: any, id: string) => id,
  (allTokensV2Map: Map<string, Token>, id: string): Token | undefined => {
    if (!id) return undefined;
    try {
      return allTokensV2Map.get(utils.getAddress(id));
    } catch (error) {
      return undefined;
    }
  }
);

export const getTokenV3ById = createSelector(
  (state: RootState) => getTokensV3Map(state),
  (_: any, id: string) => id,
  (allTokensV3Map: Map<string, Token>, id: string): Token | undefined => {
    if (!id) return undefined;
    try {
      return allTokensV3Map.get(utils.getAddress(id));
    } catch (error) {
      return undefined;
    }
  }
);

export const getTokensByIdV2V3 = createSelector(
  (state: RootState) => getTokensV2V3Map(state),
  (_: any, id: string) => id,
  (allTokensMap: Map<string, Token>, id: string): Token | undefined => {
    if (!id) return undefined;
    try {
      return allTokensMap.get(utils.getAddress(id));
    } catch (error) {
      return undefined;
    }
  }
);

export const getTopMovers = createSelector(
  (state: RootState) => state.bancor.tokensV2,
  (tokensV2: Token[]) => {
    const filtered = tokensV2.filter(
      (t) => t.isProtected && Number(t.liquidity ?? 0) > 100000
    );
    return orderBy(filtered, 'price_change_24', 'desc').slice(0, 20);
  }
);

export const getAllV2AndV3Tokens = createSelector(
  (state: RootState) => state.bancor.allTokensV2,
  (state: RootState) => state.bancor.tokensV3,
  (tokensV2, tokensV3): Token[] => {
    return uniqBy([...tokensV3, ...tokensV2], (x) => x.address);
  }
);

export const getV2AndV3Tokens = createSelector(
  (state: RootState) => state.bancor.tokensV2,
  (state: RootState) => state.bancor.tokensV3,
  (tokensV2, tokensV3): Token[] => {
    return uniqBy([...tokensV3, ...tokensV2], (x) => x.address);
  }
);

export const bancor = bancorSlice.reducer;

export const getIsAppBusy = createSelector(
  [
    (state: RootState) => state.v3Portfolio.isPortfolioLoading,
    (state: RootState) => state.notification.notifications,
  ],
  (isPortfolioLoading, notifications): boolean => {
    const hasPendingTx = notifications.some(
      (n) => n.type === NotificationType.pending
    );
    return isPortfolioLoading || hasPendingTx;
  }
);
