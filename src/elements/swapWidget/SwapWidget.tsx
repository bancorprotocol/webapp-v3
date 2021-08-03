import { useCallback, useEffect, useState } from 'react';
import { SwapHeader } from 'elements/swapHeader/SwapHeader';
import { SwapMarket } from 'elements/swapMarket/SwapMarket';
import { SwapLimit } from 'elements/swapLimit/SwapLimit';
import { loadSwapData } from 'services/observables/triggers';
import { useDispatch } from 'react-redux';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import { ethToken, wethToken } from 'services/web3/config';
import { Insight } from 'elements/swapInsights/Insight';
import { IntoTheBlock, intoTheBlockByToken } from 'services/api/intoTheBlock';

interface SwapWidgetProps {
  isLimit: boolean;
  setIsLimit: Function;
}

export const SwapWidget = ({ isLimit, setIsLimit }: SwapWidgetProps) => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);

  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState<Token | null>(null);

  const [fromTokenITB, setFromTokenITB] = useState<IntoTheBlock | undefined>();
  const [toTokenITB, setToTokenITB] = useState<IntoTheBlock | undefined>();

  const dispatch = useDispatch();

  useEffect(() => {
    loadSwapData(dispatch);
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      if (fromToken)
        setFromTokenITB(await intoTheBlockByToken(fromToken.symbol));
    })();
  }, [fromToken]);

  useEffect(() => {
    (async () => {
      if (toToken) setToTokenITB(await intoTheBlockByToken(toToken.symbol));
    })();
  }, [toToken]);

  useEffect(() => {
    const findSetToken = (token: Token) => {
      if (token) {
        const found = tokens.find((x) => x.address === token.address);
        if (found) return found;
      }

      return null;
    };
    const foundFrom = findSetToken(fromToken);
    foundFrom ? setFromToken(foundFrom) : setFromToken(tokens[0]);

    if (
      toToken &&
      fromToken &&
      fromToken.address !== wethToken &&
      toToken.address !== ethToken
    ) {
      const foundTo = findSetToken(toToken);
      foundTo ? setToToken(foundTo) : setToToken(tokens[1]);
    }
  }, [tokens, fromToken, toToken]);

  const switchTokens = () => {
    if (toToken) {
      setFromToken(toToken);
      setToToken(fromToken);
    }
  };

  return (
    <div className="flex justify-center w-full mx-auto 2xl:space-x-20">
      <div>
        <div className="widget">
          <SwapHeader isLimit={isLimit} setIsLimit={setIsLimit} />
          <hr className="widget-separator" />
          {isLimit ? (
            <SwapLimit
              fromToken={fromToken}
              setFromToken={setFromToken}
              toToken={toToken}
              setToToken={setToToken}
              switchTokens={switchTokens}
            />
          ) : (
            <SwapMarket
              fromToken={fromToken}
              setFromToken={setFromToken}
              toToken={toToken}
              setToToken={setToToken}
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
  );
};
