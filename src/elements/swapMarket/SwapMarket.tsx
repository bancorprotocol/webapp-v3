import { TokenInputField } from 'components/tokenInputField/TokenInputField';
import { useDebounce } from 'hooks/useDebounce';
import { TokenListItem } from 'services/observables/tokens';
import { useEffect, useState } from 'react';
import { ApproveTypes, getRate, swap } from 'services/web3/swap/methods';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import BigNumber from 'bignumber.js';
import { useDispatch } from 'react-redux';
import { addNotification } from 'redux/notification/notification';
import { usdByToken } from 'utils/pureFunctions';
import { useWeb3React } from '@web3-react/core';

interface SwapMarketProps {
  fromToken: TokenListItem;
  setFromToken: Function;
  toToken: TokenListItem;
  setToToken: Function;
  switchTokens: Function;
}

export const SwapMarket = ({
  fromToken,
  setFromToken,
  toToken,
  setToToken,
  switchTokens,
}: SwapMarketProps) => {
  const dispatch = useDispatch();

  const { chainId, account } = useWeb3React();
  const [fromAmount, setFromAmount] = useState('');
  const [fromDebounce, setFromDebounce] = useDebounce('');
  const [toAmount, setToAmount] = useState('');
  const [rate, setRate] = useState('');
  const [priceImpact, setPriceImpact] = useState('');

  useEffect(() => {
    (async () => {
      if (fromToken && toToken) {
        const baseRate = await getRate(fromToken, toToken, '1');
        const rate = (Number(baseRate) / 1).toFixed(4);
        setRate(rate);

        const priceImpact = new BigNumber(baseRate)
          .minus(rate)
          .div(baseRate)
          .times(100);
        setPriceImpact(priceImpact.toFixed(5));
      }
    })();
  }, [fromToken, toToken]);

  useEffect(() => {
    (async () => {
      if (!fromDebounce) setToAmount('');
      else if (fromToken && toToken) {
        const result = await getRate(fromToken, toToken, fromDebounce);
        const rate = (Number(result) / fromDebounce).toFixed(4);
        setToAmount((fromDebounce * Number(rate)).toFixed(2));
        setRate(rate);
      }
    })();
  }, [fromToken, toToken, fromDebounce]);

  const onUpdate = () => {
    console.log('update');
  };

  const onPrompt = async (
    info: {
      id: string;
      label: ApproveTypes;
    }[]
  ) => {
    console.log('info', info);

    return info[0].id;
  };

  const handleSwap = async () => {
    if (!chainId || !account) return;
    const result = await swap({
      net: chainId,
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      user: account,
      onUpdate,
      onPrompt,
    });
    dispatch(
      addNotification({
        type: 'pending',
        title: 'Test Notification',
        msg: 'Some message here...',
        txHash: result,
      })
    );
  };

  return (
    <div>
      <div className="px-20">
        <TokenInputField
          label="You Pay"
          balance={fromToken ? fromToken.balance : null}
          balanceUsd={usdByToken(fromToken)}
          token={fromToken}
          setToken={setFromToken}
          input={fromAmount}
          setInput={setFromAmount}
          debounce={setFromDebounce}
          border
          selectable
        />
      </div>

      <div className="widget-block">
        <div className="widget-block-icon cursor-pointer">
          <IconSync
            className="w-[25px] text-primary dark:text-primary-light"
            onClick={() => switchTokens()}
          />
        </div>
        <div className="mx-10 mb-16 pt-16">
          <TokenInputField
            label="You Receive"
            balance={toToken ? toToken.balance : null}
            balanceUsd={usdByToken(toToken)}
            token={toToken}
            setToken={setToToken}
            input={toAmount}
            setInput={setToAmount}
            disabled
            selectable
          />

          <div className="flex justify-between mt-15">
            <span>Rate</span>
            <span>
              1 {fromToken?.symbol} = {rate} {toToken?.symbol}
            </span>
          </div>

          <div className="flex justify-between">
            <span>Price Impact</span>
            <span>{priceImpact}%</span>
          </div>
        </div>

        <button
          onClick={() => handleSwap()}
          className="btn-primary rounded w-full"
        >
          Swap
        </button>
      </div>
    </div>
  );
};
