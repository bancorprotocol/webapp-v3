import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useDebounce } from 'hooks/useDebounce';
import { useEffect, useState } from 'react';
import { ViewToken } from 'redux/bancorAPI/bancorAPI';
import { useAppSelector } from 'redux/index';
import { getRate } from 'web3/swap/methods';

export const SwapMarket = () => {
  const tokens = useAppSelector<ViewToken[]>((state) => state.bancorAPI.tokens);
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
  const [fromAmount, setFromAmount] = useState('');
  const [fromDebounce, setFromDebounce] = useDebounce('');
  const [toAmount, setToAmount] = useState('');

  useEffect(() => {
    //getRate(fromToken., to,);
  }, [fromToken, toToken, fromDebounce]);

  useEffect(() => {
    setFromToken(tokens[0]);
    setToToken(tokens[1]);
  }, [tokens]);

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
