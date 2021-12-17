import { useCallback, useMemo, useState } from 'react';
import { SUPPORTED_WALLETS, WalletInfo } from 'services/web3/wallet/utils';
import { sendWalletEvent, WalletEvents } from 'services/api/googleTagManager';
import { setAutoLoginLS } from 'utils/localStorage';
import { setSigner } from 'services/web3';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import useAsyncEffect from 'use-async-effect';
import { isMobile } from 'react-device-detect';
import { useAppSelector } from '../../redux';
import { openWalletModal } from '../../redux/user/user';
import { useDispatch } from 'react-redux';
import { openNewTab, wait } from 'utils/pureFunctions';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

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
  title: string;
  handleWalletButtonClick: () => void;
}

export const useWalletConnect = (): UseWalletConnect => {
  const { activate, deactivate, account, connector } = useWeb3React();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletInfo>();

  const isOpen = useAppSelector<boolean>((state) => state.user.walletModal);
  const dispatch = useDispatch();

  const setIsOpen = useCallback(
    (value: boolean) => {
      dispatch(openWalletModal(value));
    },
    [dispatch]
  );

  const handleOpenModal = useCallback(() => {
    sendWalletEvent(WalletEvents.popup);
    setIsError(false);
    setIsPending(false);
    setIsOpen(true);
  }, [setIsOpen]);

  const handleConnect = useCallback(
    async (wallet: WalletInfo) => {
      const { connector, url } = wallet;
      if (url) {
        setIsOpen(false);
        return openNewTab(url);
      }

      sendWalletEvent(WalletEvents.click, {
        wallet_name: wallet.name,
      });
      setIsPending(true);
      setSelectedWallet(wallet);

      if (
        connector instanceof WalletConnectConnector &&
        connector.walletConnectProvider?.wc?.uri
      )
        connector.walletConnectProvider = undefined;

      if (connector)
        try {
          await activate(connector, undefined, true);
          setIsOpen(false);
          setAutoLoginLS(true);
          setSigner(
            new Web3Provider(await connector.getProvider()).getSigner()
          );
          const account = await connector.getAccount();
          sendWalletEvent(
            WalletEvents.connect,
            undefined,
            account || '',
            wallet.name
          );
          await wait(500);
          setIsPending(false);
        } catch (e: any) {
          console.error('failed to connect wallet. ', e.message);
          setIsError(true);
        }
    },
    [activate, setIsOpen]
  );

  const handleDisconnect = useCallback(() => {
    setSelectedWallet(undefined);
    deactivate();
    setAutoLoginLS(false);
    setIsPending(false);
    setIsError(false);
  }, [deactivate]);

  const handleWalletButtonClick = useCallback(() => {
    if (account) {
      handleDisconnect();
    } else {
      handleOpenModal();
    }
  }, [account, handleDisconnect, handleOpenModal]);

  const isMetaMaskMobile =
    isMobile && window.ethereum && window.ethereum.isMetaMask;

  useAsyncEffect(
    async (isMounted) => {
      if (selectedWallet) return;

      if (isMetaMaskMobile) {
        const wallet = SUPPORTED_WALLETS.find(
          (wallet) => wallet.name === 'MetaMask'
        )!;
        await handleConnect(wallet);
        return;
      }

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

  const title = useMemo(
    () =>
      isError
        ? 'Wallet Error'
        : isPending
        ? 'Connecting to ...'
        : 'Connect Wallet',
    [isError, isPending]
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
    title,
    handleWalletButtonClick,
  };
};
