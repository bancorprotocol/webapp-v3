import { Token } from 'services/observables/tokens';
import { wethToken, ethToken } from 'services/web3/config';

const push = (url: string, history: any) => {
  if (url !== window.location.search) history.push(url);
};

const pushSwapParams = (
  history: any,
  from: string,
  to?: string,
  limit?: boolean
) => {
  const url = `${from ? '?from=' + from : ''}${to ? '&to=' + to : ''}${
    limit ? '&limit=true' : ''
  }`;
  if (url.trim() !== '') push(url, history);
};

export const replaceLimit = (
  fromToken: Token,
  tokens: Token[],
  limit: boolean,
  history: any,
  toToken?: Token
) => {
  const toAddress =
    !limit && fromToken.address === wethToken
      ? tokens.find((x) => x.address === ethToken)?.address
      : toToken
      ? toToken.address
      : '';

  pushSwapParams(history, fromToken.address, toAddress, limit);
};

export const replaceFrom = (
  fromToken: Token,
  tokens: Token[],
  limit: boolean,
  history: any,
  toToken?: Token
) => {
  const toAddress =
    !limit && fromToken.address === wethToken
      ? tokens.find((x) => x.address === ethToken)?.address
      : toToken
      ? toToken.address
      : '';

  pushSwapParams(history, fromToken.address, toAddress, limit);
};

export const replaceTo = (
  fromToken: Token,
  limit: boolean,
  history: any,
  toToken?: Token
) => {
  pushSwapParams(history, fromToken.address, toToken?.address, limit);
};

export const switchTokens = (
  fromToken: Token,
  limit: boolean,
  history: any,
  toToken?: Token
) => {
  if (toToken)
    pushSwapParams(history, toToken.address, fromToken.address, limit);
};
