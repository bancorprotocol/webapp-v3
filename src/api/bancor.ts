import axios from 'axios';
import { EthNetworks } from '../web3/types';
import { toChecksumAddress } from 'web3-utils';

interface TokenMeta {
  id: string;
  image: string;
  contract: string;
  symbol: string;
  name: string;
  precision?: number;
}

export interface WelcomeData {
  total_liquidity: BntPrice;
  total_volume_24h: BntPrice;
  bnt_price_24h_ago: BntPrice;
  bnt_price: BntPrice;
  bnt_supply: string;
  swaps: Swap[];
  pools: Pool[];
  tokens: Token[];
}

export interface BntPrice {
  usd: null | string;
}

export interface Pool {
  pool_dlt_id: string;
  converter_dlt_id: string;
  reserves: Reserve[];
  name: string;
  liquidity: BntPrice;
  volume_24h: BntPrice;
  fees_24h: BntPrice;
  fee: string;
  version: number;
  supply: string;
  decimals: number;
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
  amount: BntPrice;
  timestamp: number;
  account_dlt_id: string;
}

export interface Token {
  symbol: string;
  dlt_id: string;
  liquidity: BntPrice;
  rate: BntPrice;
  rate_24h_ago: BntPrice;
  decimals: number;
}

export interface TokenMetaWithReserve extends TokenMeta {
  reserveWeight: number;
  decBalance: string;
}

export interface NewPool extends Pool {
  reserveTokens: TokenMetaWithReserve[];
  decFee: number;
}

export const getWelcomeData = async (
  network: EthNetworks
): Promise<WelcomeData> => {
  if (!(network === EthNetworks.Mainnet || network === EthNetworks.Ropsten)) {
    throw new Error('API does not support this network');
  }
  try {
    const { data } = await axios.get<WelcomeData>(
      network == EthNetworks.Mainnet
        ? 'https://api-v2.bancor.network/welcome'
        : 'https://ropsten-ptdczarhfq-nw.a.run.app/welcome'
    );
    return {
      ...data,
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
