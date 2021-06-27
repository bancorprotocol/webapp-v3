import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { getNetworkVariables } from 'web3/config';
import { EthNetworks } from 'web3/types';

const currentNetworkReceiver$ = new BehaviorSubject<number>(
  EthNetworks.Mainnet
);

export const currentNetwork$ = currentNetworkReceiver$.pipe(
  distinctUntilChanged(),
  shareReplay(1)
);

export const setNetwork = (chainId: EthNetworks) => {
  if (chainId === EthNetworks.Mainnet || chainId === EthNetworks.Ropsten)
    currentNetworkReceiver$.next(chainId);
};

export const networkVars$ = currentNetwork$.pipe(
  map(getNetworkVariables),
  shareReplay(1)
);
