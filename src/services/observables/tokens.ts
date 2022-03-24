import { from } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { EthNetworks } from 'services/web3/types';
import { fetchKeeperDaoTokens } from 'services/api/keeperDao';
import { APIReward } from 'services/api/bancor';
import { UTCTimestamp } from 'lightweight-charts';

export interface Token {
  address: string;
  chainId: EthNetworks;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  usdPrice: string | null;
  balance: string | null;
  liquidity: string | null;
  usd_24h_ago: string | null;
  price_change_24: number;
  price_history_7d: { time: UTCTimestamp; value: number }[];
  usd_volume_24: string | null;
  isProtected: boolean;
}

export const keeperDaoTokens$ = from(fetchKeeperDaoTokens()).pipe(
  shareReplay(1)
);