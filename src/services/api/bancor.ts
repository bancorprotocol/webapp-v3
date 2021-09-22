import axios from 'axios';
import { EthNetworks } from 'services/web3/types';
import { toChecksumAddress } from 'web3-utils';
import { UTCTimestamp } from 'lightweight-charts';

interface TokenMeta {
  id: string;
  image: string;
  contract: string;
  symbol: string;
  name: string;
  precision?: number;
}

export interface WelcomeData {
  total_liquidity: USDPrice;
  total_volume_24h: USDPrice;
  bnt_price_24h_ago: USDPrice;
  bnt_price: USDPrice;
  bnt_supply: string;
  swaps: Swap[];
  pools: APIPool[];
  tokens: APIToken[];
}

export interface USDPrice {
  usd: null | string;
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

export interface Reserve {
  address: string;
  weight: string;
  balance: string;
}

export interface Swap {
  source_token_dlt_id: string;
  target_token_dlt_id: string;
  tx_hash: string;
  input_amount: string;
  output_amount: string;
  amount: USDPrice;
  timestamp: number;
  account_dlt_id: string;
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

export interface TokenMetaWithReserve extends TokenMeta {
  reserveWeight: number;
  decBalance: string;
}

export interface NewPool extends APIPool {
  reserveTokens: TokenMetaWithReserve[];
  decFee: number;
}

export interface WelcomeDataRes extends WelcomeData {
  network: EthNetworks;
}

export const getWelcomeData = async (
  network: EthNetworks = EthNetworks.Mainnet
): Promise<WelcomeDataRes> => {
  if (!(network === EthNetworks.Mainnet || network === EthNetworks.Ropsten)) {
    throw new Error('API does not support this network');
  }
  try {
    const { data } = await axios.get<WelcomeData>(
      network === EthNetworks.Mainnet
        ? 'https://api-v2.bancor.network/welcome'
        : 'https://serve-ropsten-ptdczarhfq-nw.a.run.app/welcome'
    );
    return {
      ...data,
      network,
      pools: data.pools.map((pool) => ({
        ...pool,
        converter_dlt_id: toChecksumAddress(pool.converter_dlt_id),
        pool_dlt_id: toChecksumAddress(pool.pool_dlt_id),
      })),
      swaps: data.swaps.map((swap) => ({
        ...swap,
        account_dlt_id: toChecksumAddress(swap.account_dlt_id),
        source_token_dlt_id: toChecksumAddress(swap.source_token_dlt_id),
        target_token_dlt_id: toChecksumAddress(swap.target_token_dlt_id),
      })),
      tokens: data.tokens.map((token) => ({
        ...token,
        dlt_id: toChecksumAddress(token.dlt_id),
      })),
    };
  } catch (e) {
    console.error('Failed to load data from Bancor API', e);
    throw new Error(e);
  }
};
