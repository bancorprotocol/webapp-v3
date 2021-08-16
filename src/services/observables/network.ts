import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
} from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { getNetworkVariables } from 'services/web3/config';
import { web3 } from 'services/web3/contracts';
import { EthNetworks } from 'services/web3/types';
import { provider } from 'services/web3/wallet/connectors';

//@ts-ignore
const { ethereum } = window;

export const getChainID = (chain: string | number): EthNetworks =>
  typeof chain === 'string' ? parseInt(chain) : chain;

export const currentNetworkReceiver$ = new BehaviorSubject<number>(
  EthNetworks.Mainnet
);

export const currentNetwork$ = currentNetworkReceiver$.pipe(
  startWith(EthNetworks.Mainnet),
  distinctUntilChanged(),
  shareReplay(1)
);

export const setNetwork = (chainId: EthNetworks) => {
  if (chainId === EthNetworks.Mainnet || chainId === EthNetworks.Ropsten) {
    currentNetworkReceiver$.next(chainId);
    if (
      process.env.REACT_APP_ALCHEMY_MAINNET ||
      process.env.REACT_APP_ALCHEMY_ROPSTEN
    )
      web3.setProvider(provider(chainId));
  }
};

export const networkVars$ = currentNetwork$.pipe(
  map(getNetworkVariables),
  shareReplay(1)
);
