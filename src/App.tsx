import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { UnsupportedNetwork } from 'pages/UnsupportedNetwork';
import { LayoutHeader } from 'elements/layoutHeader/LayoutHeader';
import { NotificationAlerts } from 'elements/notifications/NotificationAlerts';
import { useDispatch } from 'react-redux';
import {
  setDarkMode,
  setDarkModeCss,
  setSlippageTolerance,
  setUsdToggle,
} from 'store/user/user';
import { setNotifications } from 'store/notification/notification';
import { store, useAppSelector } from 'store';
import { googleTagManager } from 'services/api/googleTagManager';
import {
  getDarkModeLS,
  getNotificationsLS,
  getSlippageToleranceLS,
  getTenderlyRpcLS,
  getUsdToggleLS,
  setNotificationsLS,
} from 'utils/localStorage';
import { subscribeToObservables } from 'services/observables/triggers';
import { isUnsupportedNetwork } from 'utils/helperFunctions';
import { MobileBottomNav } from 'elements/layoutHeader/MobileBottomNav';
import { setUser } from 'services/observables/user';
import { BancorRouter } from 'router/BancorRouter';
import { handleRestrictedWalletCheck } from 'services/restrictedWallets';
import { RestrictedWallet } from 'pages/RestrictedWallet';
import { useAccount, useNetwork, useProvider, useSigner } from 'wagmi';
import { setProvider, setSigner } from 'services/web3';

const handleModeChange = (_: MediaQueryListEvent) => {
  const darkMode = store.getState().user.darkMode;
  setDarkModeCss(darkMode);
};

export const App = () => {
  const user = useAppSelector((state) => state.user.account);
  const dispatch = useDispatch();
  const { chain } = useNetwork();
  const { address: account } = useAccount();
  const chainId = chain?.id;
  const provider = useProvider();
  setProvider(provider);
  const { data: signer } = useSigner();

  // TODO useAutoConnect();
  const unsupportedNetwork = isUnsupportedNetwork(chainId);
  const notifications = useAppSelector(
    (state) => state.notification.notifications
  );

  // handle dark mode system change
  useEffect(() => {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', handleModeChange);

    return () => {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .removeEventListener('change', handleModeChange);
    };
  }, []);

  useEffect(() => {
    // reload the app every 2 hours
    setTimeout(() => {
      window.location.reload();
    }, 2 * 60 * 60 * 1000);
  }, []);

  useEffect(() => {
    const usd = getUsdToggleLS();
    if (usd) dispatch(setUsdToggle(usd));

    const notify = getNotificationsLS();
    if (notify) dispatch(setNotifications(notify));

    const slippage = getSlippageToleranceLS();
    if (slippage) dispatch(setSlippageTolerance(slippage));

    subscribeToObservables(dispatch);

    const dark = getDarkModeLS();
    dispatch(setDarkMode(dark));
  }, [dispatch]);

  useEffect(() => {
    setNotificationsLS(notifications);
  }, [notifications]);

  useEffect(() => {
    setUser(account, dispatch);
    googleTagManager();
  }, [account, dispatch]);

  useEffect(() => {
    if (account && signer) {
      setSigner(signer as any, getTenderlyRpcLS() ? account : undefined);
    }
  }, [account, dispatch, signer]);

  const isWalletRestricted = !!user && handleRestrictedWalletCheck(user);

  return (
    <BrowserRouter>
      <LayoutHeader />

      {isWalletRestricted ? (
        <RestrictedWallet />
      ) : unsupportedNetwork ? (
        <UnsupportedNetwork />
      ) : (
        <main>
          <BancorRouter />
        </main>
      )}

      <MobileBottomNav />
      <NotificationAlerts />
    </BrowserRouter>
  );
};
