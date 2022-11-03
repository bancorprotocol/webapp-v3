import { useEffect, useState } from 'react';
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
  getUsdToggleLS,
  setNotificationsLS,
} from 'utils/localStorage';
import { subscribeToObservables } from 'services/observables/triggers';
import { isUnsupportedNetwork } from 'utils/helperFunctions';
import { MobileBottomNav } from 'elements/layoutHeader/MobileBottomNav';
import { useWeb3React } from '@web3-react/core';
import { useAutoConnect } from 'services/web3/wallet/hooks';
import { setUser } from 'services/observables/user';
import { BancorRouter } from 'router/BancorRouter';
import { handleRestrictedWalletCheck } from 'services/restrictedWallets';
import { RestrictedWallet } from 'pages/RestrictedWallet';
import { WarningModal } from 'components/WarningModal';
import { useProtectedPositions } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/useProtectedPositions';

const handleModeChange = (_: MediaQueryListEvent) => {
  const darkMode = store.getState().user.darkMode;
  setDarkModeCss(darkMode);
};

export const App = () => {
  const [migrationDisabled, setMigrationDisabled] = useState(false);
  const loadingPositions = useAppSelector<boolean>(
    (state) => state.liquidity.loadingPositions
  );
  const { data } = useProtectedPositions();

  const user = useAppSelector((state) => state.user.account);
  const dispatch = useDispatch();
  const { chainId, account } = useWeb3React();
  useAutoConnect();
  const unsupportedNetwork = isUnsupportedNetwork(chainId);
  const notifications = useAppSelector(
    (state) => state.notification.notifications
  );

  useEffect(() => {
    if (data.length !== 0 && !loadingPositions) setMigrationDisabled(true);
  }, [loadingPositions, data]);

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

      <WarningModal
        title="Migrations Disabled"
        description="On the TBD, migrations to v3 will no longer be supported. Withdrawals directly from v2.1 will reopen shortly thereafter."
        hrefText="More info"
        href="https://vote.bancor.network/#/proposal/0x9f80570a9133c733e81cb6578980a571be242904c9dc2dc61c2a12f8546fdd2d"
        isOpen={migrationDisabled}
        setIsOpen={setMigrationDisabled}
      />

      <MobileBottomNav />
      <NotificationAlerts />
    </BrowserRouter>
  );
};
