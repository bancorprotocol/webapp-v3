import { useEffect, useState } from 'react';
import { SwapHeader } from 'elements/swapHeader/SwapHeader';
import { SwapMarket } from 'elements/swapMarket/SwapMarket';
import { SwapLimit } from 'elements/swapLimit/SwapLimit';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import { ethToken, wethToken } from 'services/web3/config';
import { Insight } from 'elements/swapInsights/Insight';
import { IntoTheBlock, intoTheBlockByToken } from 'services/api/intoTheBlock';
import { useAsyncEffect } from 'use-async-effect';
import { useHistory } from 'react-router-dom';

interface SwapWidgetProps {
  isLimit: boolean;
  setIsLimit: Function;
  from: string | null;
  to: string | null;
  limit: string | null;
}

export const SwapWidget = ({
  isLimit,
  setIsLimit,
  from,
  to,
  limit,
}: SwapWidgetProps) => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);

  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState<Token | null>(null);

  const [fromTokenITB, setFromTokenITB] = useState<IntoTheBlock | undefined>();
  const [toTokenITB, setToTokenITB] = useState<IntoTheBlock | undefined>();
  const history = useHistory();

  useEffect(() => {
    if (tokens) {
      if (from) {
        const fromToken = tokens.find((x) => x.address === from);
        if (fromToken) setFromToken(fromToken);
      } else setFromToken(tokens[0]);

      if (to) {
        const toToken = tokens.find((x) => x.address === to);
        if (toToken) setToToken(toToken);
      } else setToToken(null);

      setIsLimit(limit);
    }
  }, [from, to, limit, tokens, setIsLimit]);

  useAsyncEffect(
    async (isMounted) => {
      if (fromToken) {
        const data = await intoTheBlockByToken(fromToken.symbol);
        if (isMounted()) {
          setFromTokenITB(data);
        }
      }
    },
    [fromToken]
  );

  useAsyncEffect(
    async (isMounted) => {
      if (toToken) {
        const data = await intoTheBlockByToken(toToken.symbol);
        if (isMounted()) {
          setToTokenITB(data);
        }
      }
    },
    [toToken]
  );

  const replaceLimit = (limit: boolean) => {
    const toAddress =
      !limit && fromToken.address === wethToken
        ? tokens.find((x) => x.address === ethToken)?.address
        : toToken
        ? toToken.address
        : '';

    const url = `?from=${fromToken.address}${
      toToken ? '&to=' + toAddress : ''
    }${limit ? '&limit=' + limit : ''}`;

    if (url !== window.location.search) history.push(url);
  };

  const replaceFrom = (token: Token) => {
    const toAddress =
      !isLimit && token.address === wethToken
        ? tokens.find((x) => x.address === ethToken)?.address
        : toToken
        ? toToken.address
        : '';

    const url = `?from=${token.address}${toAddress ? '&to=' + toAddress : ''}${
      isLimit ? '&limit=' + isLimit : ''
    }`;

    if (url !== window.location.search) history.push(url);
  };

  const replaceTo = (token?: Token) => {
    const url = `?from=${fromToken.address}${
      token ? '&to=' + token.address : ''
    }${isLimit ? '&limit=' + isLimit : ''}`;

    if (url !== window.location.search) {
      if (
        (fromToken.address === wethToken ||
          (toToken && toToken.address === ethToken)) &&
        isLimit
      )
        history.replace(url);
      else history.push(url);
    }
  };

  const switchTokens = () => {
    if (toToken) {
      const url = `?from=${toToken.address}${
        fromToken ? '&to=' + fromToken.address : ''
      }${isLimit ? '&limit=' + isLimit : ''}`;
      if (url !== window.location.search) {
        history.push(url);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-blue-4 h-screen w-screen md:h-auto md:w-auto md:bg-grey-1 md:dark:bg-blue-3">
      <div className="flex justify-center w-full mx-auto 2xl:space-x-20">
        <div>
          <div className="widget ">
            <SwapHeader isLimit={isLimit} setIsLimit={replaceLimit} />
            <hr className="widget-separator" />
            {isLimit ? (
              <SwapLimit
                fromToken={fromToken}
                setFromToken={replaceFrom}
                toToken={toToken}
                setToToken={replaceTo}
                switchTokens={switchTokens}
              />
            ) : (
              <SwapMarket
                fromToken={fromToken}
                setFromToken={replaceFrom}
                toToken={toToken}
                setToToken={replaceTo}
                switchTokens={switchTokens}
              />
            )}
          </div>
          {isLimit ? (
            <div className="text-center text-10 text-grey-4 mt-18">
              Limit orders are powered by KeeperDAO
            </div>
          ) : (
            ''
          )}
        </div>
        <Insight
          fromToken={fromToken}
          toToken={toToken}
          fromTokenIntoBlock={fromTokenITB}
          toTokenIntoBlock={toTokenITB}
        />
      </div>
    </div>
  );
};
