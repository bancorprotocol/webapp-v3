import { useEffect, useState } from 'react';
import { SwapHeader } from 'elements/swapHeader/SwapHeader';
import { SwapMarket } from 'elements/swapMarket/SwapMarket';
import { SwapLimit } from 'elements/swapLimit/SwapLimit';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import { ethToken, wethToken } from 'services/web3/config';
import { useDispatch } from 'react-redux';
import { loadSwapData } from 'services/observables/triggers';
import { Insight } from 'elements/swapInsights/Insight';
import { IntoTheBlock, intoTheBlockByToken } from 'services/api/intoTheBlock';
import { useAsyncEffect } from 'use-async-effect';
import { useHistory } from 'react-router-dom';

interface SwapWidgetProps {
  isLimit: boolean;
  setIsLimit: Function;
  from: string;
  to: string;
}

export const SwapWidget = ({
  isLimit,
  setIsLimit,
  from,
  to,
}: SwapWidgetProps) => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);

  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState<Token | null>(null);

  const [fromTokenITB, setFromTokenITB] = useState<IntoTheBlock | undefined>();
  const [toTokenITB, setToTokenITB] = useState<IntoTheBlock | undefined>();
  const history = useHistory();
  const dispatch = useDispatch();

  useEffect(() => {
    loadSwapData(dispatch);
  }, [dispatch]);

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
    }
  }, [from, to, tokens]);

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

  const replaceFrom = (token: Token) => {
    const toAddress =
      !isLimit && token.address === wethToken
        ? '/' + tokens.find((x) => x.address === ethToken)?.address
        : toToken
        ? '/' + toToken.address
        : '';
    history.push(`/${token.address}${toAddress}`);
  };

  const replaceTo = (token?: Token) => {
    history.push(`/${fromToken.address}${token ? '/' + token.address : ''}`);
  };

  const switchTokens = () => {
    if (toToken) {
      history.push(`/${toToken.address}/${fromToken.address}`);
    }
  };

  return (
    <div className="bg-white dark:bg-blue-4 h-screen w-screen md:h-auto md:w-auto md:bg-grey-1 md:dark:bg-blue-3">
      <div className="flex justify-center w-full mx-auto 2xl:space-x-20">
        <div>
          <div className="widget ">
            <SwapHeader isLimit={isLimit} setIsLimit={setIsLimit} />
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
