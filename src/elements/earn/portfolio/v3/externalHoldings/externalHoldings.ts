import { Token } from 'services/observables/tokens';
import BigNumber from 'bignumber.js';
import {
  mockedNonUniPositions,
  mockedUniPositions,
} from 'elements/earn/portfolio/v3/externalHoldings/mockedData';

export interface ApyVisionUniPosition {
  nft_id: number;
  pool_provider_name: string;
  pool_address: string;
  pool_name: string;
  user_address: string;
  token0_name: string;
  token1_name: string;
  token0_id: string;
  token1_id: string;
  lower_tick: number;
  upper_tick: number;
  liquidity: number;
  nft_position_snapshot_count: number;
  fee: number;
  lower_tick_vs_token0: number;
  upper_tick_vs_token0: number;
  lower_tick_vs_token1: number;
  upper_tick_vs_token1: number;
  current_day_data: {
    date: string;
    timestamp: number;
    hodl_value: number;
    all_token0_value: number;
    all_token1_value: number;
    position_usd_value_at_block: number;
    token0_pending_fees: number;
    token0_collected_fees: number;
    token1_pending_fees: number;
    token1_collected_fees: number;
    collected_fees_usd: number;
    pending_fees_usd: number;
    fee_apys: {
      apy_7d: number;
      apy_14d: number;
      apy_30d: number;
      apy_60d: number;
      apy_90d: number;
      apy_inception: number;
    };
    token0_amount: number;
    token1_amount: number;
    token0_amount_if_exit: number;
    token1_amount_if_exit: number;
    token0_price_usd: number;
    token1_price_usd: number;
    roi_vs_hodl: null;
    roi_vs_all_token0: null;
    roi_vs_all_token1: null;
    initial_capital_usd: number;
  };
}

export interface ApyVisionPosition {
  address: string;
  totalFeeUsd: 247.39293077295486;
  totalValueUsd: 23391878726.035645;
  netGainUsd: 23391875680.47562;
  netGainPct: 99.99998698026755;
  chainId: 1;
  searchCountMonthly: 0;
  isProMember: false;
  userPools: {
    poolProviderKey: string;
    networkId: number;
    lastSyncBlock: number;
    name: string;
    address: string;
    totalLpTokens: number;
    ownedLpTokensPct: number;
    mintBurntLedgerLpTokens: number;
    currentOwnedLpTokens: number;
    lpTokenUsdPrice: number;
    totalValueUsdViaLpTokens: number;
    totalValueUsd: number;
    impLossPct: number;
    initialCapitalValueUsd: number;
    totalFeeUsd: number;
    hasPartialSessions: boolean;
    tokens: {
      tokenAddress: string;
      tokenName: string;
      tokenStartingBalance: number;
      tokenCurrentBalance: number;
      tokenCurrentPrice: number;
      tokenUsdGain: number;
      weight: number;
      averageWeightedExecutedPrice: number;
    }[];
    netGainUsd: number;
    netGainPct: number;
  }[];
  showUpgrade: boolean;
  priceLastUpdated: number;
  nextUpdateAt: number;
  message: null;
  allowDownload: boolean;
  visionTokenBalance: number;
  nftExpiryDate: number;
  nftTrialReturnEndDate: number;
  loggedInWallet: null;
  totalCurrentPools: number;
}

export interface ExternalHoldingPosition {
  ammName: string;
  tokens: Token[];
  usdValue: number;
  rektStatus: string;
}

const REKT_STATUS_THRESHOLD = -50;

const getRektStatus = (usdValue: number, hodlValue: number): string => {
  const rektUsdValue = new BigNumber(usdValue).minus(hodlValue);
  const rektAtRisk = new BigNumber(rektUsdValue).lt(REKT_STATUS_THRESHOLD);
  return rektAtRisk ? rektUsdValue.toString() : 'At risk';
};

export const getExternalHoldingsUni = (
  tokensMap: Map<string, Token>
): ExternalHoldingPosition[] => {
  return mockedUniPositions
    .map((pos) => {
      const token0 = tokensMap.get(pos.token0_name);
      const token1 = tokensMap.get(pos.token1_name);
      if (!token0 && !token1) {
        return undefined;
      }
      const tokens = [token0, token1].filter((t) => !!t) as Token[];
      const usdValue = pos.current_day_data.position_usd_value_at_block;
      const rektStatus = getRektStatus(
        usdValue,
        pos.current_day_data.hodl_value
      );
      const ammName = 'Uniswap';
      const newPos: ExternalHoldingPosition = {
        ammName,
        tokens,
        rektStatus,
        usdValue,
      };
      return newPos;
    })
    .filter((pos) => !!pos) as ExternalHoldingPosition[];
};

export const getExternalHoldingsNonUni = (
  tokensMap: Map<string, Token>
): ExternalHoldingPosition[] => {
  return mockedNonUniPositions.userPools
    .map((pos) => {
      const tokens = pos.tokens
        .map((token) => tokensMap.get(token.tokenName))
        .filter((t) => !!t) as Token[];

      if (tokens.length === 0) {
        return undefined;
      }

      const usdValue = pos.totalValueUsd;
      const rektStatus = getRektStatus(usdValue, pos.initialCapitalValueUsd);
      const ammName = 'Non-Uniswap';
      const newPos: ExternalHoldingPosition = {
        ammName,
        tokens,
        rektStatus,
        usdValue,
      };
      return newPos;
    })
    .filter((pos) => !!pos) as ExternalHoldingPosition[];
};
