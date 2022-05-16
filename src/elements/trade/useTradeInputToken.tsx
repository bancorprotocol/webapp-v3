import PQueue from 'p-queue';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'store/index';
import { useCallback, useMemo, useState } from 'react';
import { getV3Rate, getV3RateInverse } from 'services/web3/swap/market';
import { calcOppositeValue } from 'components/tokenInput/useTokenInputV3';
import { useTknFiatInput } from 'elements/trade/useTknFiatInput';

const queue = new PQueue({ concurrency: 1 });

interface useTradeInputNewProps {
  from?: string;
  to?: string;
  tokens: Token[];
}
export const useTradeInputToken = ({
  from,
  to,
  tokens,
}: useTradeInputNewProps) => {
  const isFiat = useAppSelector((state) => state.user.usdToggle);

  const [fromInputTkn, setFromInputTkn] = useState('');
  const [fromInputFiat, setFromInputFiat] = useState('');

  const [toInputTkn, setToInputTkn] = useState('');
  const [toInputFiat, setToInputFiat] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const tokensMap = useMemo(
    () => new Map(tokens.map((token) => [token.address, token])),
    [tokens]
  );

  const fromToken = useMemo(() => tokensMap.get(from ?? ''), [from, tokensMap]);
  const toToken = useMemo(() => tokensMap.get(to ?? ''), [to, tokensMap]);

  const onFromDebounce = useCallback(
    async (val: string) => {
      if (!fromToken || !toToken) return;
      console.log('from debounce', val);
      queue.clear();
      await queue.add(async () => {
        if (queue.size !== 0) return;
        setIsLoading(true);
        try {
          const toValueTkn = val
            ? await getV3Rate(fromToken, toToken, val)
            : '';
          const toValueFiat = toValueTkn
            ? calcOppositeValue(
                false,
                toValueTkn,
                toToken.usdPrice,
                toToken.decimals
              )
            : '';
          console.log('from: ', fromToken.symbol);
          console.log('to: ', toToken.symbol);
          if (isFiat) {
            setToInputTkn(toValueTkn);
            setToInputFiat(toValueFiat);
          } else {
            setToInputTkn(toValueTkn);
            setToInputFiat(toValueFiat);
          }
        } catch (e) {
          console.error('Trade Widget onFromDebounce failed.', e);
        } finally {
          setIsLoading(false);
        }
      });
    },
    [fromToken, isFiat, setToInputFiat, setToInputTkn, toToken]
  );

  const fromInput = useTknFiatInput({
    token: fromToken,
    setInputTkn: setFromInputTkn,
    setInputFiat: setFromInputFiat,
    onDebounce: onFromDebounce,
    inputTkn: fromInputTkn,
    inputFiat: fromInputFiat,
  });

  const onToDebounce = useCallback(
    async (val: string) => {
      if (!fromToken || !toToken) return;
      console.log('to debounce', val);
      queue.clear();
      await queue.add(async () => {
        if (queue.size !== 0) return;
        setIsLoading(true);
        try {
          const fromValueTkn = val
            ? await getV3RateInverse(fromToken, toToken, val)
            : '';
          const fromValueFiat = fromValueTkn
            ? calcOppositeValue(
                false,
                fromValueTkn,
                fromToken.usdPrice,
                fromToken.decimals
              )
            : '';

          if (isFiat) {
            setFromInputTkn(fromValueTkn);
            setFromInputFiat(fromValueFiat);
          } else {
            setFromInputTkn(fromValueTkn);
            setFromInputFiat(fromValueFiat);
          }
        } catch (e) {
          console.error('Trade Widget onFromDebounce failed.', e);
        } finally {
          setIsLoading(false);
        }
      });
    },
    [fromToken, isFiat, setFromInputFiat, setFromInputTkn, toToken]
  );

  const toInput = useTknFiatInput({
    token: toToken,
    setInputTkn: setToInputTkn,
    setInputFiat: setToInputFiat,
    onDebounce: onToDebounce,
    inputTkn: toInputTkn,
    inputFiat: toInputFiat,
  });

  return { fromInput, toInput, isLoading };
};
