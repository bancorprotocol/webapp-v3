import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useDebounce } from 'hooks/useDebounce';
import { TokenListItem } from 'observables/tokenList';
import { useEffect, useState } from 'react';
import { getRate } from 'web3/swap/methods';

interface SwapMarketProps {
  fromToken: TokenListItem;
  setFromToken: Function;
  toToken: TokenListItem;
  setToToken: Function;
}

export const SwapMarket = ({
  fromToken,
  setFromToken,
  toToken,
  setToToken,
}: SwapMarketProps) => {
  const [fromAmount, setFromAmount] = useState('');
  const [fromDebounce, setFromDebounce] = useDebounce('');
  const [toAmount, setToAmount] = useState('');
  const [rate, setRate] = useState('');

  useEffect(() => {
    (async () => {
      if (fromToken && toToken && fromDebounce)
        setRate(
          await getRate(fromToken.address, toToken.address, fromDebounce)
        );
    })();
  }, [fromToken, toToken, fromDebounce]);

  return (
    <div>
      <div className="px-20">
        <TokenInputField
          label="You Pay"
          balance={123.4567}
          balanceUsd={98.76}
          token={fromToken}
          setToken={setFromToken}
          input={fromAmount}
          setInput={setFromAmount}
          debounce={setFromDebounce}
          border
          selectable
        />
      </div>

      <div className="widget-block mt-20">
        <div className="mx-10 mb-16">
          <TokenInputField
            label="You Receive"
            balance={123.4567}
            balanceUsd={98.76}
            token={toToken}
            setToken={setToToken}
            input={toAmount}
            setInput={setToAmount}
            disabled
            selectable
          />

          <div className="flex justify-between mt-15">
            <span>Rate</span>
            <span>1 BNT = 0.00155432 ETH</span>
          </div>

          <div className="flex justify-between">
            <span>Price Impact</span>
            <span>0.2000%</span>
          </div>
        </div>

        <button className="btn-primary rounded w-full">Swap</button>
      </div>
    </div>
  );
};
