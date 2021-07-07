import { BehaviorSubject, Subject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { getNetworkVariables } from 'services/web3/config';
import { web3 } from 'services/web3/contracts';
import { EthNetworks } from 'services/web3/types';
import { provider } from 'services/web3/wallet/connectors';

//@ts-ignore
const { ethereum } = window;

export const getChainID = (chain: string | number): EthNetworks =>
  typeof chain === 'string' ? parseInt(chain) : chain;

export const currentNetworkReceiver$ = new Subject<number>();

const handleChainChanged = (chain: string | number) => {
  const chainID = getChainID(chain);
  web3.setProvider(provider(chainID));
  currentNetworkReceiver$.next(chainID);
};

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
