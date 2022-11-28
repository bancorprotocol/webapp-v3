import { useCallback, useMemo, useState } from 'react';
import { SUPPORTED_WALLETS, WalletInfo } from 'services/web3/wallet/utils';
import {
  sendWalletEvent,
  WalletEvents,
} from 'services/api/googleTagManager/wallet';
import { setAutoLoginLS } from 'utils/localStorage';
import { setSigner } from 'services/web3';
import { Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import useAsyncEffect from 'use-async-effect';
import { useAppSelector } from 'store';
import { openWalletModal } from 'store/user/user';
import { useDispatch } from 'react-redux';
import { openNewTab, wait } from 'utils/pureFunctions';
import { setUser } from 'services/observables/user';
import { isForkAvailable } from 'services/web3/config';
import { requestSwitchChain } from 'utils/helperFunctions';

export interface UseWalletConnect {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setSelectedWallet: (wallet: WalletInfo) => void;
  handleConnect: (wallet: WalletInfo) => void;
  handleDisconnect: () => void;
  handleOpenModal: () => void;
  reset: () => void;
  isPending: boolean;
  isError: boolean;
  account?: string | null;
  selectedWallet?: WalletInfo;
  SUPPORTED_WALLETS: WalletInfo[];
  title: string;
  handleWalletButtonClick: () => void;
}

export const useWalletConnect = (): UseWalletConnect => {
  const { activate, deactivate, connector } = useWeb3React();
  const account = useAppSelector((state) => state.user.account);

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

  const reset = () => {
    setIsError(false);
    setIsPending(false);
  };

  const handleOpenModal = useCallback(() => {
    sendWalletEvent(WalletEvents.popup);
    reset();
    setIsOpen(true);
  }, [setIsOpen]);

  const handleConnect = useCallback(
    async (wallet: WalletInfo) => {
      const { connector, url, name } = wallet;
      if (url) {
        setIsOpen(false);
        return openNewTab(url);
      }

      sendWalletEvent(WalletEvents.click, {
        wallet_name: wallet.name,
      });
      setIsPending(true);
      setSelectedWallet(wallet);

      if (connector)
        try {
          await activate(connector, undefined, true);
          setIsOpen(false);
          setAutoLoginLS(true);
          const account = await connector.getAccount();
          setSigner(
            new Web3Provider(await connector.getProvider()).getSigner(),
            isForkAvailable ? account : undefined
          );
          sendWalletEvent(
            WalletEvents.connect,
            undefined,
            account || '',
            wallet.name
          );
          await wait(500);
          setIsPending(false);
          if (name === 'MetaMask') {
            requestSwitchChain();
          }
        } catch (e: any) {
          console.error('failed to connect wallet. ', e.message);
          setIsError(true);
        }
    },
    [activate, setIsOpen]
  );

  const handleDisconnect = useCallback(() => {
    setUser(undefined, dispatch);
    setSelectedWallet(undefined);
    deactivate();
    setAutoLoginLS(false);
    setIsPending(false);
    setIsError(false);
  }, [deactivate, dispatch]);

  const handleWalletButtonClick = useCallback(() => {
    if (account) {
      handleDisconnect();
    } else {
      handleOpenModal();
    }
  }, [account, handleDisconnect, handleOpenModal]);

  useAsyncEffect(
    async (isMounted) => {
      if (selectedWallet) return;

      const wallet = SUPPORTED_WALLETS.find((wallet) => wallet.canAutoConnect)!;
      if (wallet) {
        await handleConnect(wallet);
        return;
      }

      if (connector) {
        const account = isForkAvailable
          ? await connector.getAccount()
          : undefined;

        setSigner(
          new Web3Provider(await connector.getProvider()).getSigner(),
          account
        );
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
    setSelectedWallet,
    handleConnect,
    handleDisconnect,
    handleOpenModal,
    isPending,
    isError,
    account,
    selectedWallet,
    SUPPORTED_WALLETS,
    title,
    reset,
    handleWalletButtonClick,
  };
};
