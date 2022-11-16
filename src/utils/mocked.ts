import { Pool, Reserve } from 'services/observables/pools';
import { Token } from 'services/observables/tokens';
import { genericToken, zeroAddress } from 'services/web3/config';

export const mockToken: Token = {
  address: zeroAddress,
  logoURI: genericToken,
  name: 'Ethereum',
  balance: '1.085561228177686039',
  symbol: 'MOCK',
  decimals: 18,
  usdPrice: '3138.970276',
  liquidity: '142917205.826758',
  usd_24h_ago: '3096.083312',
  price_change_24: 1.39,
  price_history_7d: [],
  usd_volume_24: '5627813.477706',
  isProtected: true,
};

export const fallbackPool = (
  pool_dlt_id: string,
  reserveTokenAddress: string,
  bntReserve: Reserve
): Pool => ({
  name: 'N/A',
  pool_dlt_id,
  converter_dlt_id: '',
  reserves: [fallbackReserve(reserveTokenAddress), bntReserve],
  liquidity: 0,
  volume_24h: 0,
  fees_24h: 0,
  fee: 0,
  version: 0,
  supply: 0,
  decimals: 18,
  apr_24h: 0,
  apr_7d: 0,
  isProtected: false,
});

export const fallbackReserve = (address: string): Reserve => ({
  address,
  weight: '',
  balance: '',
  symbol: 'N/A',
  logoURI: '',
  decimals: 18,
  usdPrice: 0,
});
