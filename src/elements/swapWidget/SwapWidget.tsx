import { useCallback, useEffect, useState } from 'react';
import { SwapHeader } from 'elements/swapHeader/SwapHeader';
import { SwapMarket } from 'elements/swapMarket/SwapMarket';
import { SwapLimit } from 'elements/swapLimit/SwapLimit';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import { ethToken } from 'services/web3/config';
import { Insight } from 'elements/swapInsights/Insight';
import { IntoTheBlock, intoTheBlockByToken } from 'services/api/intoTheBlock';
import { useAsyncEffect } from 'use-async-effect';
import { useNavigation } from 'services/router';

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
  const { replaceLimit, replaceFrom, replaceTo, switchTokens } =
    useNavigation();

  const ethOrFirst = useCallback(() => {
    const eth = tokens.find((x) => x.address === ethToken);
    return eth ? eth : tokens[0];
  }, [tokens]);

  const [fromToken, setFromToken] = useState(ethOrFirst());
  const [toToken, setToToken] = useState<Token | undefined>();

  const [fromTokenITB, setFromTokenITB] = useState<IntoTheBlock | undefined>();
  const [toTokenITB, setToTokenITB] = useState<IntoTheBlock | undefined>();

  useEffect(() => {
    if (tokens) {
      if (from) {
        const fromToken = tokens.find((x) => x.address === from);
        if (fromToken) setFromToken(fromToken);
        else setFromToken(ethOrFirst());
      } else setFromToken(ethOrFirst());

      if (to) {
        const toToken = tokens.find((x) => x.address === to);
        if (toToken) setToToken(toToken);
        else setToToken(undefined);
      } else setToToken(undefined);

      setIsLimit(limit);
    }
  }, [from, to, limit, tokens, setIsLimit, ethOrFirst]);

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

  return (
    <div className="bg-white dark:bg-blue-4 h-screen w-screen md:h-auto md:w-auto md:bg-grey-1 md:dark:bg-blue-3">
      <div className="flex justify-center w-full mx-auto 2xl:space-x-20">
        <div>
          <div className="widget ">
            <SwapHeader
              isLimit={isLimit}
              setIsLimit={(limit: boolean) =>
                replaceLimit(fromToken, tokens, limit, toToken)
              }
            />
            <hr className="widget-separator" />
            {isLimit ? (
              <SwapLimit
                fromToken={fromToken}
                setFromToken={(from: Token) =>
                  replaceFrom(from, tokens, true, toToken)
                }
                toToken={toToken}
                setToToken={(to: Token) => replaceTo(fromToken, true, to)}
                switchTokens={() => switchTokens(fromToken, true, toToken)}
              />
            ) : (
              <SwapMarket
                fromToken={fromToken}
                setFromToken={(from: Token) =>
                  replaceFrom(from, tokens, false, toToken)
                }
                toToken={toToken}
                setToToken={(to: Token) => replaceTo(fromToken, false, to)}
                switchTokens={() => switchTokens(fromToken, false, toToken)}
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
