import PQueue from 'p-queue';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'store/index';
import { useCallback, useMemo, useState } from 'react';
import { getV3PriceImpact, getV3Rate } from 'services/web3/swap/market';
import { calcOppositeValue } from 'components/tokenInput/useTokenInputV3';
import { useTknFiatInput } from 'elements/trade/useTknFiatInput';
import { toBigNumber } from 'utils/helperFunctions';

const queue = new PQueue({ concurrency: 1 });

interface useTradeInputNewProps {
  from?: string;
  to?: string;
  tokens: Token[];
}
export const useTradeWidget = ({ from, to, tokens }: useTradeInputNewProps) => {
  const isFiat = useAppSelector((state) => state.user.usdToggle);

  const [fromInputTkn, setFromInputTkn] = useState('');
  const [fromInputFiat, setFromInputFiat] = useState('');

  const [toInputTkn, setToInputTkn] = useState('');
  const [toInputFiat, setToInputFiat] = useState('');

  const [priceImpact, setPriceImpact] = useState('0.0000');

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
      queue.clear();
      await queue.add(async () => {
        if (queue.size !== 0) return;
        setIsLoading(!!val);
        try {
          const toValueTkn = val
            ? await getV3Rate(fromToken, toToken, val)
            : '';

          const v3PI = !!val
            ? await getV3PriceImpact(fromToken, toToken, val, toValueTkn)
            : toBigNumber(0);

          isNaN(v3PI.toNumber())
            ? setPriceImpact('0.0000')
            : setPriceImpact(v3PI.toString());

          const toValueFiat = toValueTkn
            ? calcOppositeValue(
                false,
                toValueTkn,
                toToken.usdPrice,
                toToken.decimals
              )
            : '';
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

  const toInput = useTknFiatInput({
    token: toToken,
    setInputTkn: setToInputTkn,
    setInputFiat: setToInputFiat,
    inputTkn: toInputTkn,
    inputFiat: toInputFiat,
  });

  return { fromInput, toInput, isLoading, priceImpact };
};
