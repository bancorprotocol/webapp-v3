import { useCallback, useEffect, useState } from 'react';
import { SwapHeader } from 'elements/swapHeader/SwapHeader';
import { SwapMarket } from 'elements/swapMarket/SwapMarket';
import { SwapLimit } from 'elements/swapLimit/SwapLimit';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'store';
import { ethToken } from 'services/web3/config';
import { Insight } from 'elements/swapInsights/Insight';
import { IntoTheBlock, intoTheBlockByToken } from 'services/api/intoTheBlock';
import { useAsyncEffect } from 'use-async-effect';
import { useNavigation } from 'hooks/useNavigation';

interface SwapWidgetProps {
  isLimit: boolean;
  setIsLimit: Function;
  from: string | null;
  to: string | null;
  limit: string | null;
  refreshLimit: Function;
}

export const SwapWidget = ({
  isLimit,
  setIsLimit,
  from,
  to,
  limit,
  refreshLimit,
}: SwapWidgetProps) => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);

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

  const { goToPage } = useNavigation();

  return (
    <div className="2xl:space-x-20 flex justify-center mx-auto">
      <div className="flex justify-center w-full md:w-auto mx-auto space-x-30">
        <div className="w-full md:w-auto">
          <div className="widget">
            <SwapHeader
              isLimit={isLimit}
              setIsLimit={(limit: boolean) =>
                goToPage.trade({
                  from: fromToken?.address,
                  to: toToken?.address,
                  limit,
                })
              }
            />
            <hr className="widget-separator" />
            {isLimit ? (
              <SwapLimit
                fromToken={fromToken}
                setFromToken={(from: Token) =>
                  goToPage.trade({
                    from: from.address,
                    to: toToken?.address,
                    limit: true,
                  })
                }
                toToken={toToken}
                setToToken={(to: Token) =>
                  goToPage.trade({
                    from: fromToken?.address,
                    to: to.address,
                    limit: true,
                  })
                }
                switchTokens={() =>
                  goToPage.trade({
                    from: toToken?.address,
                    to: fromToken?.address,
                    limit: true,
                  })
                }
                refreshLimit={refreshLimit}
              />
            ) : (
              <SwapMarket
                fromToken={fromToken}
                setFromToken={(from: Token) =>
                  goToPage.trade({
                    from: from.address,
                    to: toToken?.address,
                    limit: false,
                  })
                }
                toToken={toToken}
                setToToken={(to: Token) =>
                  goToPage.trade({
                    from: fromToken?.address,
                    to: to.address,
                    limit: false,
                  })
                }
                switchTokens={() =>
                  goToPage.trade({
                    from: toToken?.address,
                    to: fromToken?.address,
                    limit: false,
                  })
                }
              />
            )}
          </div>
          {isLimit ? (
            <div className="text-center text-10 text-grey mt-18">
              Limit orders are powered by Rook
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
