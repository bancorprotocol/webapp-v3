import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { getNetworkVariables } from 'services/web3/config';
import { setProvider } from 'services/web3';
import { EthNetworks } from 'services/web3/types';
import { buildAlchemyUrl } from 'services/web3/wallet/connectors';
import { providers } from 'ethers';

//@ts-ignore
const { ethereum } = window;

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
    if (
      process.env.REACT_APP_ALCHEMY_MAINNET ||
      process.env.REACT_APP_ALCHEMY_ROPSTEN
    )
      setProvider(
        new providers.JsonRpcProvider(buildAlchemyUrl(chainId)),
        false
      );
  }
};

export const networkVars$ = currentNetwork$.pipe(
  map(getNetworkVariables),
  shareReplay(1)
);
