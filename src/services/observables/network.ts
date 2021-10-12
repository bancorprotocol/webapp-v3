import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { getNetworkVariables } from 'services/web3/config';
import { web3 } from 'services/web3/contracts';
import { EthNetworks } from 'services/web3/types';
import { provider } from 'services/web3/wallet/connectors';

export const getChainID = (chain: string | number): EthNetworks =>
  typeof chain === 'string' ? parseInt(chain) : chain;

export const currentNetworkReceiver$ = new BehaviorSubject<number>(
  EthNetworks.Mainnet
);

export const currentNetwork$ = currentNetworkReceiver$.pipe(
  distinctUntilChanged(),
  shareReplay(1)
);

export const setNetwork = (chainId: EthNetworks) => {
  if (chainId === EthNetworks.Mainnet || chainId === EthNetworks.Ropsten) {
    currentNetworkReceiver$.next(chainId);
    web3.setProvider(provider(chainId));
  }
};

export const networkVars$ = currentNetwork$.pipe(
  map(getNetworkVariables),
  shareReplay(1)
);
