import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { getNetworkVariables } from 'services/web3/config';
import { EthNetworks } from 'services/web3/types';

//@ts-ignore
const { ethereum } = window;

export const getChainID = (chain: string | number): EthNetworks =>
  typeof chain === 'string' ? parseInt(chain) : chain;

const currentNetworkReceiver$ = new BehaviorSubject<number>(
  EthNetworks.Ropsten
);

const handleChainChanged = (chain: string | number) =>
  currentNetworkReceiver$.next(getChainID(chain));

ethereum.on('chainChanged', handleChainChanged);

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
