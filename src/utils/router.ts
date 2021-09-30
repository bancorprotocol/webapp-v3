import { Token } from 'services/observables/tokens';
import { wethToken, ethToken } from 'services/web3/config';

const push = (url: string, history: any) => {
  if (url !== window.location.search) history.push(url);
};

const pushSwapParams = (
  history: any,
  from?: string,
  to?: string,
  limit?: boolean
) => {
  push(`?from=${from}&to=${to}&limit${limit}`, history);
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

  const url = `?from=${fromToken?.address}${toToken ? '&to=' + toAddress : ''}${
    limit ? '&limit=' + limit : ''
  }`;

  if (!fromToken) push(limit ? '?limit=' + limit : '', history);
  else push(url, history);
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

  const url = `?from=${fromToken.address}${
    toAddress ? '&to=' + toAddress : ''
  }${limit ? '&limit=' + limit : ''}`;

  push(url, history);
};

export const replaceTo = (
  fromToken: Token,
  limit: boolean,
  history: any,
  toToken?: Token
) => {
  const url = `?from=${fromToken.address}${
    toToken ? '&to=' + toToken.address : ''
  }${limit ? '&limit=' + limit : ''}`;

  push(url, history);
};

export const switchTokens = (
  fromToken: Token,
  toToken: Token,
  limit: boolean,
  history: any
) => {
  if (toToken) {
    const url = `?from=${toToken.address}${
      fromToken ? '&to=' + fromToken.address : ''
    }${limit ? '&limit=' + limit : ''}`;

    push(url, history);
  }
};
