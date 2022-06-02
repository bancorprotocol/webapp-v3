import { Token } from 'services/observables/tokens';
import { AMMProvider } from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings';

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

export interface ApyVisionNonUniPositionToken {
  tokenAddress: string;
  tokenName: string;
  tokenStartingBalance: number;
  tokenCurrentBalance: number;
  tokenCurrentPrice: number;
  tokenUsdGain: number;
  weight: number;
  averageWeightedExecutedPrice: number;
}

export interface ApyVisionNonUniPosition {
  poolProviderKey: AMMProvider;
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
  tokens: ApyVisionNonUniPositionToken[];
  netGainUsd: number;
  netGainPct: number;
}

export interface ApyVisionUniResponse {
  result: ApyVisionUniPosition[];
}
export interface ApyVisionNonUniResponse {
  address: string;
  totalFeeUsd: 247.39293077295486;
  totalValueUsd: 23391878726.035645;
  netGainUsd: 23391875680.47562;
  netGainPct: 99.99998698026755;
  chainId: 1;
  searchCountMonthly: 0;
  isProMember: false;
  userPools: ApyVisionNonUniPosition[];
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

export interface ExternalHolding {
  ammKey: AMMProvider;
  ammName: string;
  tokens: Token[];
  nonBancorTokens: ApyVisionNonUniPositionToken[];
  usdValue: number;
  rektStatus: string;
  poolTokenAddress: string;
  poolTokenBalanceWei: string;
}

export interface ApyVisionData {
  positionsUni: ApyVisionUniPosition[];
  positionsNonUni: ApyVisionNonUniPosition[];
}
