import '@rainbow-me/rainbowkit/styles.css';
import {
  RainbowKitProvider,
  connectorsForWallets,
  wallet,
} from '@rainbow-me/rainbowkit';
import { chain, configureChains, createClient, WagmiConfig } from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { ReactNode } from 'react';
import { getTenderlyRpcLS } from 'utils/localStorage';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import {
  customRainbowThemeDark,
  customRainbowThemeLight,
} from 'services/web3/rainbowKit/customRainbowTheme';
import { useAppSelector } from 'store';
import { getDarkMode } from 'store/user/user';

const { chains, provider } = configureChains(
  [chain.mainnet],
  getTenderlyRpcLS()
    ? [jsonRpcProvider({ rpc: () => ({ http: getTenderlyRpcLS() }) })]
    : [
        alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_MAINNET }),
        publicProvider(),
      ]
);

const connectors = connectorsForWallets([
  {
    groupName: 'Available',
    wallets: [
      wallet.metaMask({ chains }),
      wallet.walletConnect({ chains }),
      wallet.coinbase({ appName: 'Bancor', chains }),
      wallet.argent({ chains }),
      wallet.brave({ chains }),
      wallet.imToken({ chains }),
      wallet.trust({ chains }),
      wallet.rainbow({ chains }),
      wallet.ledger({ chains }),
      wallet.steak({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export const RainbowKitWallet = ({ children }: { children: ReactNode }) => {
  const darkmode = useAppSelector(getDarkMode);

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        theme={darkmode ? customRainbowThemeDark : customRainbowThemeLight}
        chains={chains}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
