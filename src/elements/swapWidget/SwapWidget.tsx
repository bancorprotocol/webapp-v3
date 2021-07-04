import { createContext, useEffect, useState } from 'react';
import { SwapHeader } from 'elements/swapHeader/SwapHeader';
import { SwapMarket } from 'elements/swapMarket/SwapMarket';
import { SwapLimit } from 'elements/swapLimit/SwapLimit';
import { loadSwapData } from 'services/observables/triggers';
import { useDispatch } from 'react-redux';
import { TokenListItem } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import usePrevious from 'hooks/usePrevious';

export const Toggle = createContext(false);
interface SwapWidgetProps {
  isLimit: boolean;
  setIsLimit: Function;
}

export const SwapWidget = ({ isLimit, setIsLimit }: SwapWidgetProps) => {
  const tokens = useAppSelector<TokenListItem[]>(
    (state) => state.bancor.tokens
  );

  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [toggle, setToggle] = useState(false);
  const dispatch = useDispatch();
  const previousTokens = usePrevious(tokens);

  useEffect(() => {
    loadSwapData(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (previousTokens && previousTokens.length === 0) {
      setFromToken(tokens[0]);
      setToToken(tokens[1]);
    }
  }, [tokens, previousTokens]);

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <Toggle.Provider value={toggle}>
      <div className="widget mx-auto">
        <SwapHeader
          isLimit={isLimit}
          setIsLimit={setIsLimit}
          setToggle={setToggle}
        />
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
    </Toggle.Provider>
  );
};
