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

export interface PriceDictionary {
  bnt: string;
  usd: string;
  eur: string;
  eth: string;
  tkn: string;
}

export interface APIWelcomeV3 {
  pools: APIPoolV3[];
}

export interface APIPoolV3 {
  poolDltId: string;
  poolTokenDltId: string;
  name: string;
  decimals: number;
  tradingLiquidity: PriceDictionary;
  volume24h: PriceDictionary;
  fees24h: PriceDictionary;
}

export interface APITokenV3 {
  symbol: string;
  dltId: string;
  rate: PriceDictionary;
  rate_24h_ago: PriceDictionary;
  rateHistory7d: { time: UTCTimestamp; value: number }[];
}

export interface APIStatsV3 {
  totalLiquidity: PriceDictionary;
  totalLiquidity24hAgo: PriceDictionary;
  volume: PriceDictionary;
  volume24hAgo: PriceDictionary;
  fees: PriceDictionary;
  fees24hAgo: PriceDictionary;
  bntRate: PriceDictionary;
  bntRate24hAgo: PriceDictionary;
  bntStakedPercentage: number;
  bntStakedPercentage24hAgo: number;
}
