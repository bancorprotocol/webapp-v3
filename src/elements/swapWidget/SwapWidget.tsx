import { useCallback, useEffect, useState } from 'react';
import { SwapHeader } from 'elements/swapHeader/SwapHeader';
import { TokenMinimal } from 'services/observables/tokens';
import { useAppSelector } from 'store';
import { ethToken } from 'services/web3/config';
import { Insight } from 'elements/swapInsights/Insight';
import { IntoTheBlock, intoTheBlockByToken } from 'services/api/intoTheBlock';
import { useAsyncEffect } from 'use-async-effect';
import { TradeWidget } from 'elements/trade/TradeWidget';
import { getTradeTokensWithExternal } from 'store/bancor/bancor';

interface SwapWidgetProps {
  from: string | null;
  to: string | null;
  limit: string | null;
}

export const SwapWidget = ({ from, to, limit }: SwapWidgetProps) => {
  const tokens = useAppSelector<TokenMinimal[]>(getTradeTokensWithExternal);

  const ethOrFirst = useCallback(() => {
    const eth = tokens.find((x) => x.address === ethToken);
    return eth ? eth : tokens[0];
  }, [tokens]);

  const [fromToken, setFromToken] = useState(ethOrFirst());
  const [toToken, setToToken] = useState<TokenMinimal | undefined>();

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
    }
  }, [from, to, limit, tokens, ethOrFirst]);

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
    <div className="2xl:space-x-20 flex justify-center mx-auto">
      <div className="flex justify-center w-full md:w-auto mx-auto space-x-30">
        <div className="w-full md:w-auto">
          <div className="widget md:min-w-[485px] rounded-40">
            <SwapHeader />
            <hr className="widget-separator" />
            <TradeWidget
              tokens={tokens}
              from={fromToken?.address}
              to={toToken?.address}
            />
          </div>
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
