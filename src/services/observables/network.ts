import { Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay } from 'rxjs/operators';
import { getNetworkVariables } from 'services/web3/config';
import { web3 } from 'services/web3/contracts';
import { EthNetworks } from 'services/web3/types';
import { provider } from 'services/web3/wallet/connectors';

//@ts-ignore
const { ethereum } = window;

const supportedNetworks = [EthNetworks.Mainnet, EthNetworks.Ropsten];
const isSupportedNetwork = (network: EthNetworks) =>
  supportedNetworks.includes(network);

export const getChainID = (chain: string | number): EthNetworks =>
  typeof chain === 'string' ? parseInt(chain) : chain;

export const currentNetworkReceiver$ = new Subject<EthNetworks>();

const handleChainChanged = (chain: string | number) => {
  const chainID = getChainID(chain);
  web3.setProvider(provider(chainID));
  currentNetworkReceiver$.next(chainID);
};

if (ethereum && ethereum.on) ethereum.on('chainChanged', handleChainChanged);

export const currentNetwork$ = currentNetworkReceiver$.pipe(
  distinctUntilChanged(),
  filter((network) => isSupportedNetwork(network)),
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
