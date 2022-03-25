import axios from 'axios';
import { utils } from 'ethers';
import { UTCTimestamp } from 'lightweight-charts';
import { getMockV3Tokens } from 'services/api/mockV3Welcome';

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

export const getWelcomeData = async (): Promise<WelcomeData> => {
  try {
    const { data } = await axios.get<WelcomeData>(
      'https://api-v2.bancor.network/welcome'
    );
    // TODO remove MOCKED TEST TOKENS
    data.tokens = [...data.tokens, ...getMockV3Tokens()];

    return {
      ...data,
      pools: data.pools.map((pool) => ({
        ...pool,
        reserves: pool.reserves.map((reserve) => ({
          ...reserve,
          address: utils.getAddress(reserve.address),
        })),
        converter_dlt_id: utils.getAddress(pool.converter_dlt_id),
        pool_dlt_id: utils.getAddress(pool.pool_dlt_id),
      })),
      tokens: data.tokens.map((token) => ({
        ...token,
        dlt_id: utils.getAddress(token.dlt_id),
      })),
    };
  } catch (e: any) {
    console.error('Failed to load data from Bancor API', e);
    throw new Error(e);
  }
};
