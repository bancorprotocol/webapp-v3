import { UTCTimestamp } from 'lightweight-charts';

export interface WelcomeData {
  total_liquidity: {
    usd: string;
    bnt: string;
  };
  total_liquidity_24h_ago: {
    usd: string;
    bnt: string;
  };
  total_volume_24h: USDPrice;
  total_volume_24h_ago: USDPrice;
  total_fees_24h: USDPrice;
  total_fees_24h_ago: USDPrice;
  total_network_fees_24h: USDPrice;
  total_network_fees_24h_ago: USDPrice;
  bnt_price_24h_ago: USDPrice;
  bnt_price: USDPrice;
  bnt_supply: string;
  bnt_supply_24h_ago: string;
  pools: APIPool[];
  tokens: APIToken[];
}

export interface USDPrice {
  usd: string;
}

export interface APIReserve {
  address: string;
  weight: string;
  balance: string;
  apr?: number;
}

export interface APIReward {
  starts_at: UTCTimestamp;
  ends_at: UTCTimestamp;
}

export interface APIPool {
  pool_dlt_id: string;
  converter_dlt_id: string;
  reserves: APIReserve[];
  name: string;
  liquidity: USDPrice;
  volume_24h: USDPrice;
  fees_24h: USDPrice;
  network_fees_24h: USDPrice;
  fees_7d: USDPrice;
  network_fees_7d: USDPrice;
  fee: string;
  version: number;
  supply: string;
  decimals: number;
  isWhitelisted: boolean;
  reward?: APIReward;
}

export interface APIToken {
  symbol: string;
  dlt_id: string;
  liquidity: USDPrice;
  rate: USDPrice;
  rate_24h_ago: USDPrice;
  decimals: number;
  rates_7d: string[];
}

// V3

export interface APIDataV3<T> {
  data: T;
  timestamp: { ethereum: { block: number; timestamp: number } };
}

export interface PriceDictionary {
  bnt: string;
  usd: string;
  eur: string;
  eth: string;
  tkn: string;
}

export interface APIPoolV3 {
  poolDltId: string;
  poolTokenDltId: string;
  name: string;
  decimals: number;
  tradingLiquidityBNT: PriceDictionary;
  tradingLiquidityTKN: PriceDictionary;
  volume24h: PriceDictionary;
  fees24h: PriceDictionary;
  networkFees24h: PriceDictionary;
  stakedBalance: PriceDictionary;
  liquidity: PriceDictionary;
  tradingFeePPM?: string;
  tradingEnabled?: boolean;
  depositingEnabled?: boolean;
  standardRewardsClaimed24h: PriceDictionary;
  standardRewardsProviderJoined: PriceDictionary;
  standardRewardsProviderLeft: PriceDictionary;
  standardRewardsStaked: PriceDictionary;
  volume7d: PriceDictionary;
  fees7d: PriceDictionary;
  networkFees7d: PriceDictionary;
}

export interface APIBntV3
  extends Omit<
    APIPoolV3,
    | 'tradingFeePPM'
    | 'tradingLiquidityBNT'
    | 'tradingLiquidityTKN'
    | 'standardRewardsProviderJoined'
    | 'standardRewardsProviderLeft'
  > {
  tradingLiquidity: PriceDictionary;
}

export interface APITokenV3 {
  symbol: string;
  dltId: string;
  rate: PriceDictionary;
  rate24hAgo: PriceDictionary;
  rateHistory7d: { time: UTCTimestamp; value: number }[];
}

export interface APIStatsV3 {
  tradingLiquidityBNT: Omit<PriceDictionary, 'tkn'>;
  tradingLiquidityBNT24hAgo: Omit<PriceDictionary, 'tkn'>;
  tradingLiquidityTKN: Omit<PriceDictionary, 'tkn'>;
  tradingLiquidityTKN24hAgo: Omit<PriceDictionary, 'tkn'>;
  totalVolume24h: Omit<PriceDictionary, 'tkn'>;
  totalVolume24hAgo: Omit<PriceDictionary, 'tkn'>;
  totalFees24h: Omit<PriceDictionary, 'tkn'>;
  totalFees24hAgo: Omit<PriceDictionary, 'tkn'>;
  totalNetworkFees24h: Omit<PriceDictionary, 'tkn'>;
  totalNetworkFees24hAgo: Omit<PriceDictionary, 'tkn'>;
  stakedBalanceBNT: Omit<PriceDictionary, 'tkn'>;
  bntRate: string;
  bntRate24hAgo: string;
}
