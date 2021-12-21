import { useEffect, useState } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { Swap } from 'pages/Swap';
import { NotFound } from 'pages/NotFound';
import { UnsupportedNetwork } from 'pages/UnsupportedNetwork';
import { Tokens } from 'pages/Tokens';
import { Pools } from 'pages/earn/pools/Pools';
import { Portfolio } from 'pages/earn/portfolio/Portfolio';
import { Vote } from 'pages/Vote';
import { Fiat } from 'pages/Fiat';
import { LayoutHeader } from 'elements/layoutHeader/LayoutHeader';
import { useAutoConnect } from 'services/web3/wallet/hooks';
import { setUser } from 'services/observables/user';
import { NotificationAlerts } from 'elements/notifications/NotificationAlerts';
import { setNetwork } from 'services/observables/network';
import { Sidebar } from 'elements/sidebar/Sidebar';
import { Slideover } from 'components/slideover/Slideover';
import { useDispatch } from 'react-redux';
import {
  setDarkMode,
  setSlippageTolerance,
  setUsdToggle,
} from 'redux/user/user';
import {
  Notification,
  setNotifications,
} from 'redux/notification/notification';
import { useAppSelector } from 'redux/index';
import { googleTagManager } from 'services/api/googleTagManager';
import { EthNetworks } from 'services/web3/types';
import {
  getDarkModeLS,
  getNotificationsLS,
  getSlippageToleranceLS,
  getUsdToggleLS,
  setNotificationsLS,
} from 'utils/localStorage';
import { subscribeToObservables } from 'services/observables/triggers';
import { isUnsupportedNetwork } from 'utils/helperFunctions';
import { RewardsClaim } from 'pages/earn/portfolio/rewards/RewardsClaim';
import { RewardsStake } from 'pages/earn/portfolio/rewards/RewardsStake';
import { AddLiquidity } from 'pages/earn/pools/AddLiquidity';
import { TermsOfUse } from './pages/TermsOfUse';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { MarketingBanner } from './elements/marketingBanner/MarketingBanner';
import { keepWSOpen } from 'services/web3';

export const App = () => {
  const dispatch = useDispatch();
  const { chainId, account } = useWeb3React();
  useAutoConnect();
  const unsupportedNetwork = isUnsupportedNetwork(chainId);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const notifications = useAppSelector<Notification[]>(
    (state) => state.notification.notifications
  );

  useEffect(() => {
    const usd = getUsdToggleLS();
    if (usd) dispatch(setUsdToggle(usd));

    const notify = getNotificationsLS();
    if (notify) dispatch(setNotifications(notify));

    const slippage = getSlippageToleranceLS();
    if (slippage) dispatch(setSlippageTolerance(slippage));

    subscribeToObservables(dispatch);
    keepWSOpen();

    const dark = getDarkModeLS();
    if (dark) dispatch(setDarkMode(dark));
  }, [dispatch]);

  useEffect(() => {
    setNotificationsLS(notifications);
  }, [notifications]);

  useEffect(() => {
    if (chainId) setNetwork(chainId);
    else setNetwork(EthNetworks.Mainnet);
  }, [chainId]);

  useEffect(() => {
    setUser(account);
    googleTagManager('', '');
  }, [account]);

  const showBanner = useAppSelector<boolean>((state) => state.user.showBanner);

  return (
    <BrowserRouter>
      <nav className={'hidden md:block'}>
        <Sidebar
          isMinimized={isSidebarMinimized}
          setIsMinimized={setIsSidebarMinimized}
        />
      </nav>
      <nav className={'md:hidden'}>
        <Slideover isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}>
          <div className="w-full w-[200px]">
            <Sidebar
              isMinimized={isSidebarMinimized}
              setIsMinimized={setIsSidebarMinimized}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </div>
        </Slideover>
      </nav>

      <LayoutHeader
        isMinimized={isSidebarMinimized}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {unsupportedNetwork ? (
        <UnsupportedNetwork />
      ) : (
        <div
          className={`md:mr-[30px] pt-[75px] transition-all duration-500 ${
            isSidebarMinimized ? 'md:ml-[96px] ' : 'md:ml-[230px] '
          }`}
        >
          {showBanner && <MarketingBanner />}
          <main
            className={`max-w-[1400px] mx-auto mb-30 ${
              showBanner ? 'pt-40 md:pt-20' : 'pt-20'
            }`}
          >
            <Switch>
              <Route exact strict path="/" component={Swap} />
              <Route
                exact
                path="/eth/swap"
                render={(props) => {
                  return <Redirect to={`/${props.location.search}`} />;
                }}
              />
              <Route exact strict path="/tokens" component={Tokens} />
              <Route exact strict path="/pools" component={Pools} />
              <Route exact path="/eth/data">
                <Redirect to="/pools" />
              </Route>
              <Route
                exact
                strict
                path="/pools/add-liquidity/:id"
                component={AddLiquidity}
              />
              <Route
                exact
                path="/eth/portfolio/stake/add/single/:id"
                render={(props) => (
                  <Redirect
                    to={`/pools/add-liquidity/${props.match.params.id}`}
                  />
                )}
              />
              <Route
                exact
                path="/eth/pool/add/:id"
                render={(props) => (
                  <Redirect
                    to={`/pools/add-liquidity/${props.match.params.id}`}
                  />
                )}
              />
              <Route exact strict path="/portfolio" component={Portfolio} />
              <Route exact path="/eth/portfolio">
                <Redirect to="/portfolio" />
              </Route>
              <Route
                exact
                strict
                path="/portfolio/rewards/claim"
                component={RewardsClaim}
              />
              <Route exact path="/eth/portfolio/stake/rewards/withdraw">
                <Redirect to="/portfolio/rewards/claim" />
              </Route>
              <Route
                exact
                strict
                path="/portfolio/rewards/stake/:id"
                component={RewardsStake}
              />
              <Route
                exact
                path="/eth/portfolio/stake/rewards/restake/:id"
                render={(props) => (
                  <Redirect
                    to={`/portfolio/rewards/stake/${props.match.params.id}`}
                  />
                )}
              />
              <Route exact strict path="/vote" component={Vote} />
              <Route exact path="/eth/vote">
                <Redirect to="/vote" />
              </Route>
              <Route exact strict path="/fiat" component={Fiat} />
              <Route exact path="/eth/fiat">
                <Redirect to="/fiat" />
              </Route>
              <Route exact strict path="/terms-of-use" component={TermsOfUse} />
              <Route
                exact
                strict
                path="/privacy-policy"
                component={PrivacyPolicy}
              />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      )}
      <NotificationAlerts />
    </BrowserRouter>
  );
};
