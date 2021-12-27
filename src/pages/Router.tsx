import { Redirect, Route, Switch } from 'react-router-dom';
import {
  addLiquidity,
  addLiquidityByID,
  fiat,
  pools,
  portfolio,
  portfolioRewardsClaim,
  portfolioRewardsStake,
  portfolioRewardsStakeByID,
  privacyPolicy,
  swap,
  tokens,
  tos,
  vote,
} from 'services/router';
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

const legacySwap = '/eth/swap';
const legacyPools = '/eth/data';
const legacyStake = '/eth/portfolio/stake/add/single/:id';
const legacyStakeDual = '/eth/pool/add/:id';
const legacyPortfolio = '/eth/portfolio';
const legacyClaimRewards = '/eth/portfolio/stake/rewards/withdraw';
const legacyStakeRewards = '/eth/portfolio/stake/rewards/restake/:id';
const legacyVote = '/eth/vote';
const legacyFiat = '/eth/fiat';

export const Router = () => {
  return (
    <Switch>
      <Route exact path="/">
        <Redirect to={swap} />
      </Route>
      <Route exact strict path={swap} component={Swap} />
      <Route
        exact
        path={legacySwap}
        render={(props) => {
          return <Redirect to={`/${props.location.search}`} />;
        }}
      />
      <Route exact strict path={tokens} component={Tokens} />
      <Route exact strict path={pools} component={Pools} />
      <Route exact path={legacyPools}>
        <Redirect to={pools} />
      </Route>
      <Route exact strict path={addLiquidity} component={AddLiquidity} />
      <Route
        exact
        path={legacyStake}
        render={(props) => (
          <Redirect to={addLiquidityByID(props.match.params.id)} />
        )}
      />
      <Route
        exact
        path={legacyStakeDual}
        render={(props) => (
          <Redirect to={addLiquidityByID(props.match.params.id)} />
        )}
      />
      <Route exact strict path={portfolio} component={Portfolio} />
      <Route exact path={legacyPortfolio}>
        <Redirect to={portfolio} />
      </Route>
      <Route
        exact
        strict
        path={portfolioRewardsClaim}
        component={RewardsClaim}
      />
      <Route exact path={legacyClaimRewards}>
        <Redirect to={portfolioRewardsClaim} />
      </Route>
      <Route
        exact
        strict
        path={portfolioRewardsStake}
        component={RewardsStake}
      />
      <Route
        exact
        path={legacyStakeRewards}
        render={(props) => (
          <Redirect to={portfolioRewardsStakeByID(props.match.params.id)} />
        )}
      />
      <Route exact strict path={vote} component={Vote} />
      <Route exact path={legacyVote}>
        <Redirect to={vote} />
      </Route>
      <Route exact strict path={fiat} component={Fiat} />
      <Route exact path={legacyFiat}>
        <Redirect to={fiat} />
      </Route>
      <Route exact strict path={tos} component={TermsOfUse} />
      <Route exact strict path={privacyPolicy} component={PrivacyPolicy} />
      <Route component={NotFound} />
    </Switch>
  );
};
