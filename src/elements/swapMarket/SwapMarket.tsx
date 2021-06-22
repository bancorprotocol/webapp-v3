import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useDebounce } from 'hooks/useDebounce';
import { TokenListItem } from 'observables/tokenList';
import { useEffect, useState } from 'react';
import { useAppSelector } from 'redux/index';
import { getRate } from 'web3/swap/methods';
import { useDispatch } from 'react-redux';
import { addNotification } from 'redux/notification/notification';

export const SwapMarket = () => {
  const dispatch = useDispatch();

  const tokens = useAppSelector<TokenListItem[]>(
    (state) => state.bancorAPI.tokens
  );
  const [fromToken, setFromToken] = useState(tokens[0]);
  const [toToken, setToToken] = useState(tokens[1]);
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

        <button
          onClick={() =>
            dispatch(
              addNotification({
                type: 'pending',
                title: 'Test Notification',
                msg: 'Some message here...',
                txHash:
                  '0x20d27ee47229981e5d8677387ca1d10cb0fe07b25861f09a37581a2ea916fb9c',
              })
            )
          }
          className="btn-primary rounded w-full"
        >
          Swap
        </button>
      </div>
    </div>
  );
};
