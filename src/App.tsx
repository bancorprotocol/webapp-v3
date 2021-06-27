import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { Swap } from 'pages/Swap';
import { Loading } from 'pages/Loading';
import { NotFound } from 'pages/NotFound';
import { ButtonSamples } from 'pages/ButtonSamples';
import { UnsupportedNetwork } from 'pages/UnsupportedNetwork';
import { Tokens } from 'pages/Tokens';
import { Pools } from 'pages/Pools';
import { Portfolio } from 'pages/Portfolio';
import { Governance } from 'pages/Governance';
import { Vote } from 'pages/Vote';
import { Fiat } from 'pages/Fiat';
import { LayoutHeader } from 'elements/layoutHeader/LayoutHeader';
import { useAutoConnect } from 'services/web3/wallet/hooks';
import { isAutoLogin, isUnsupportedNetwork } from 'utils/pureFunctions';
import { setUser } from 'services/observables/user';
import { LayoutHeaderMobile } from 'elements/layoutHeaderMobile/LayoutHeaderMobile';
import { NotificationAlerts } from 'elements/notifications/NotificationAlerts';
import { setNetwork } from 'services/observables/network';
import { Sidebar } from 'elements/sidebar/Sidebar';
import { Slideover } from 'components/slideover/Slideover';

export const App = () => {
  const { chainId, account } = useWeb3React();
  const [loading, setLoading] = useState(true);
  const unsupportedNetwork = isUnsupportedNetwork(chainId);
  const triedAutoLogin = useAutoConnect();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (chainId || triedAutoLogin || !isAutoLogin()) setLoading(false);
  }, [setLoading, chainId, triedAutoLogin]);

  useEffect(() => {
    setUser(account);
    if (chainId) setNetwork(chainId);
  }, [account, chainId]);

  return (
    <BrowserRouter>
      <section className={'hidden md:block'}>
        <Sidebar />
      </section>
      <section className={'md:hidden'}>
        <Slideover isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}>
          <div className="w-full w-[200px]">
            <Sidebar setIsSidebarOpen={setIsSidebarOpen} />
          </div>
        </Slideover>
      </section>
      <LayoutHeader />
      <LayoutHeaderMobile setIsSidebarOpen={setIsSidebarOpen} />
      {loading ? (
        <Loading />
      ) : unsupportedNetwork ? (
        <UnsupportedNetwork />
      ) : (
        <main className="pt-12 md:pt-[145px]">
          <Switch>
            <Route exact strict path="/" component={Swap} />
            <Route exact strict path="/tokens" component={Tokens} />
            <Route exact strict path="/pools" component={Pools} />
            <Route exact strict path="/portfolio" component={Portfolio} />
            <Route exact strict path="/governance" component={Governance} />
            <Route exact strict path="/vote" component={Vote} />
            <Route exact strict path="/fiat" component={Fiat} />
            <Route exact strict path="/buttons" component={ButtonSamples} />
            <Route component={NotFound} />
          </Switch>
        </main>
      )}
      <NotificationAlerts />
    </BrowserRouter>
  );
};
