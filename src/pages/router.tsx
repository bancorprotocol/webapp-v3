import { Redirect, Route, Switch } from 'react-router-dom';
import { AddLiquidity } from './earn/pools/AddLiquidity';
import { Pools } from './earn/pools/Pools';
import { Portfolio } from './earn/portfolio/Portfolio';
import { RewardsClaim } from './earn/portfolio/rewards/RewardsClaim';
import { RewardsStake } from './earn/portfolio/rewards/RewardsStake';
import { Fiat } from './Fiat';
import { NotFound } from './NotFound';
import { PrivacyPolicy } from './PrivacyPolicy';
import { Swap } from './Swap';
import { TermsOfUse } from './TermsOfUse';
import { Tokens } from './Tokens';
import { Vote } from './Vote';

export const Router = () => {
  return (
    <Switch>
      <Route exact path="/">
        <Redirect to="/swap" />
      </Route>
      <Route exact strict path="/swap" component={Swap} />
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
          <Redirect to={`/pools/add-liquidity/${props.match.params.id}`} />
        )}
      />
      <Route
        exact
        path="/eth/pool/add/:id"
        render={(props) => (
          <Redirect to={`/pools/add-liquidity/${props.match.params.id}`} />
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
          <Redirect to={`/portfolio/rewards/stake/${props.match.params.id}`} />
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
      <Route exact strict path="/privacy-policy" component={PrivacyPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
};
