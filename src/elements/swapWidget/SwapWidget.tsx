import { useEffect, useState } from 'react';
import { SwapHeader } from 'elements/swapHeader/SwapHeader';
import { SwapMarket } from 'elements/swapMarket/SwapMarket';
import { SwapLimit } from 'elements/swapLimit/SwapLimit';
import { loadSwapData } from 'observables/triggers';
import { useDispatch } from 'react-redux';
import { TokenListItem } from 'observables/tokenList';
import { useAppSelector } from 'redux/index';

export const SwapWidget = () => {
  const tokens = useAppSelector<TokenListItem[]>(
    (state) => state.bancorAPI.tokens
  );

  const [isLimit, setIsLimit] = useState(false);
  const [isUsd, setIsUsd] = useState(false);
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const dispatch = useDispatch();

  useEffect(() => {
    loadSwapData(dispatch);
  }, [dispatch]);

  useEffect(() => {
    setFromToken(tokens[0]);
    setToToken(tokens[1]);
  }, [tokens]);

  return (
    <div className="widget mx-auto">
      <SwapHeader
        isLimit={isLimit}
        setIsLimit={setIsLimit}
        isUsd={isUsd}
        setIsUsd={setIsUsd}
      />
      <hr className="widget-separator" />
      {isLimit ? (
        <SwapLimit
          fromToken={fromToken}
          setFromToken={setFromToken}
          toToken={toToken}
          setToToken={setToToken}
        />
      ) : (
        <SwapMarket
          fromToken={fromToken}
          setFromToken={setFromToken}
          toToken={toToken}
          setToToken={setToToken}
        />
      )}
    </div>
  );
};
