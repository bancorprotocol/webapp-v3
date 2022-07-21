import { RewardsProgramRaw } from 'services/web3/v3/portfolio/standardStaking';
import { PriceDictionary } from 'services/api/bancorApi/bancorApi.types';

export interface PriceDictionaryV3 {
  bnt?: string;
  usd?: string;
  eur?: string;
  eth?: string;
  tkn: string;
}

export interface PoolApr {
  tradingFees: number;
  standardRewards: number;
  autoCompounding: number;
  total: number;
}

export interface PoolV3Chain {
  poolDltId: string;
  poolTokenDltId: string;
  name: string;
  symbol: string;
  decimals: number;
  tradingLiquidity: {
    BNT: PriceDictionaryV3;
    TKN: PriceDictionaryV3;
  };
  stakedBalance: PriceDictionaryV3;
  tradingFeePPM: number;
  tradingEnabled: boolean;
  depositingEnabled: boolean;
  programs: RewardsProgramRaw[];
  logoURI: string;
  rate?: PriceDictionary;
  rate24hAgo?: PriceDictionary;
  latestProgram?: RewardsProgramRaw;
  balance?: {
    tkn: string;
    bnTkn: string;
  };
  volume?: {
    volume7d: PriceDictionaryV3;
    volume24h: PriceDictionaryV3;
  };
  fees?: {
    fees7d: PriceDictionaryV3;
    fees24h: PriceDictionaryV3;
  };
  apr?: {
    apr24h: PoolApr;
    apr7d: PoolApr;
  };
  standardRewards?: {
    claimed24h: PriceDictionaryV3;
    providerJoined: PriceDictionaryV3;
    providerLeft: PriceDictionaryV3;
    staked: PriceDictionaryV3;
  };
}
