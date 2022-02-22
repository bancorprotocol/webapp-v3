import { useHistory } from 'react-router-dom';
import { Token } from 'services/observables/tokens';
import { wethToken, ethToken } from 'services/web3/config';

const liquidityBase = '/pools/add-liquidity/';
const rewardsBase = '/portfolio/rewards/';
const rewardsBaseStake = `${rewardsBase}stake/`;
export const swap = '/swap';
export const tokens = '/tokens';
export const pools = '/pools';
export const vote = '/vote';
export const fiat = '/fiat';
export const tos = '/terms-of-use';
export const privacyPolicy = '/privacy-policy';
export const portfolio = '/portfolio';
export const addLiquidity = `${liquidityBase}:id`;
export const addLiquidityError = `${liquidityBase}error`;
export const portfolioRewardsClaim = `${rewardsBase}claim`;
export const portfolioRewardsStake = `${rewardsBaseStake}:id`;

export const addLiquidityByID = (id: string) => `${liquidityBase}${id}`;
export const portfolioRewardsStakeByID = (id: string) =>
  `${rewardsBaseStake}${id}`;
export const portfolioRewardsStakeByIDnPos = (id: string, pos: string) =>
  `${rewardsBaseStake}${id}?posGroupId=${pos}`;
export const swapByfrom = (from?: string) =>
  `${swap}${from ? `?from=${from}` : ''}`;

export const useNavigation = () => {
  const history = useHistory();

  const push = (url: string) => {
    if (url !== window.location.search) history.push(url);
  };

  const pushPortfolio = () => push(portfolio);

  const pushPools = () => push(pools);

  const pushLiquidityError = () => push(addLiquidityError);

  const pushRewardsStakeByID = (id: string) =>
    push(portfolioRewardsStakeByID(id));

  const pushRewardsStakeByIDnPos = (id: string, pos: string) =>
    push(portfolioRewardsStakeByIDnPos(id, pos));

  const pushAddLiquidityByID = (id: string) => push(addLiquidityByID(id));

  const pushSwapParams = (from: string, to?: string, limit?: boolean) => {
    const url = `${from ? '?from=' + from : ''}${to ? '&to=' + to : ''}${
      limit ? '&limit=true' : ''
    }`;
    if (url.trim() !== '') push(url);
  };

  const replaceLimit = (
    fromToken: Token,
    tokens: Token[],
    limit: boolean,
    toToken?: Token
  ) => {
    const toAddress =
      !limit && fromToken.address === wethToken
        ? tokens.find((x) => x.address === ethToken)?.address
        : toToken
        ? toToken.address
        : '';

    pushSwapParams(fromToken.address, toAddress, limit);
  };

  const replaceFrom = (
    fromToken: Token,
    tokens: Token[],
    limit: boolean,
    toToken?: Token
  ) => {
    const toAddress =
      !limit && fromToken.address === wethToken
        ? tokens.find((x) => x.address === ethToken)?.address
        : toToken
        ? toToken.address
        : '';

    pushSwapParams(fromToken.address, toAddress, limit);
  };

  const replaceTo = (fromToken: Token, limit: boolean, toToken?: Token) => {
    pushSwapParams(fromToken.address, toToken?.address, limit);
  };

  const switchTokens = (fromToken: Token, limit: boolean, toToken?: Token) => {
    if (toToken) pushSwapParams(toToken.address, fromToken.address, limit);
  };

  return {
    replaceLimit,
    replaceFrom,
    replaceTo,
    switchTokens,
    pushPools,
    pushPortfolio,
    pushLiquidityError,
    pushRewardsStakeByID,
    pushRewardsStakeByIDnPos,
    pushAddLiquidityByID,
  };
};
