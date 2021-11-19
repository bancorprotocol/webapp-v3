import { useState } from 'react';
import { SUPPORTED_WALLETS, WalletInfo } from 'services/web3/wallet/utils';
import { sendWalletEvent, WalletEvents } from 'services/api/googleTagManager';
import { setAutoLoginLS } from 'utils/localStorage';
import { setSigner } from 'services/web3';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import useAsyncEffect from 'use-async-effect';

export interface UseWalletConnect {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  handleConnect: (wallet: WalletInfo) => void;
  handleDisconnect: () => void;
  handleOpenModal: () => void;
  isPending: boolean;
  isError: boolean;
  account?: string | null;
  selectedWallet?: WalletInfo;
  SUPPORTED_WALLETS: WalletInfo[];
}

export const useWalletConnect = (): UseWalletConnect => {
  const { activate, deactivate, account, connector } = useWeb3React();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo>();

  const handleOpenModal = () => {
    sendWalletEvent(WalletEvents.popup);
    setIsError(false);
    setIsPending(false);
    setIsOpen(true);
  };

  const handleConnect = async (wallet: WalletInfo) => {
    sendWalletEvent(WalletEvents.click, {
      wallet_name: wallet.name,
    });
    setIsPending(true);
    setSelectedWallet(wallet);
    const { connector } = wallet;

    try {
      await activate(connector, undefined, true);
      setIsOpen(false);
      setAutoLoginLS(true);
      setSigner(new Web3Provider(await connector.getProvider()).getSigner());
      const account = await connector.getAccount();
      sendWalletEvent(
        WalletEvents.connect,
        undefined,
        account || '',
        wallet.name
      );
    } catch (e) {
      console.error('failed to connect wallet. ', e.message);
      setIsError(true);
    }
  };

  const handleDisconnect = () => {
    setSelectedWallet(undefined);
    deactivate();
    setAutoLoginLS(false);
  };

  useAsyncEffect(
    async (isMounted) => {
      if (selectedWallet) return;

      if (connector) {
        setSigner(new Web3Provider(await connector.getProvider()).getSigner());
        const wallet = SUPPORTED_WALLETS.find(
          (x) => typeof x.connector === typeof connector
        )!;
        if (isMounted()) {
          setSelectedWallet(wallet);
        }
      }
    },
    [connector, selectedWallet]
  );

  return {
    isOpen,
    setIsOpen,
    handleConnect,
    handleDisconnect,
    handleOpenModal,
    isPending,
    isError,
    account,
    selectedWallet,
    SUPPORTED_WALLETS,
  };
};
