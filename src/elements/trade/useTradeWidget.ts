import PQueue from 'p-queue';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'store/index';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getRateAndPriceImapct } from 'services/web3/swap/market';
import { calcOppositeValue } from 'components/tokenInput/useTokenInputV3';
import {
  useTknFiatInput,
  useTokenInputV3Return,
} from 'elements/trade/useTknFiatInput';
import { toBigNumber } from 'utils/helperFunctions';
import { wethToken } from 'services/web3/config';

const queue = new PQueue({ concurrency: 1 });

interface UseTradeWidgetProps {
  from?: string;
  to?: string;
  tokens: Token[];
}

export interface UseTradeWidgetReturn {
  isLoading: boolean;
  fromInput: useTokenInputV3Return | undefined;
  toInput: useTokenInputV3Return | undefined;
  priceImpact: string;
  filteredTokens: Token[];
  isV3: boolean;
}

export const useTradeWidget = ({
  from,
  to,
  tokens,
}: UseTradeWidgetProps): UseTradeWidgetReturn => {
  const isFiat = useAppSelector((state) => state.user.usdToggle);

  const [fromInputTkn, setFromInputTkn] = useState('');
  const [fromInputFiat, setFromInputFiat] = useState('');

  const [toInputTkn, setToInputTkn] = useState('');
  const [toInputFiat, setToInputFiat] = useState('');

  const [priceImpact, setPriceImpact] = useState('0.0000');
  const [isV3, setIsV3] = useState<boolean>(false);

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
          const { rate, priceImpact, isV3 } =
            fromToken.address === wethToken
              ? { rate: val, priceImpact: '0', isV3: true }
              : val
              ? await getRateAndPriceImapct(fromToken, toToken, val, false)
              : { rate: '', priceImpact: '', isV3: true };

          setPriceImpact(priceImpact);
          setIsV3(isV3);

          const toValue = toBigNumber(rate).isZero() ? '' : rate;

          const toValueFiat = toValue
            ? calcOppositeValue(
                false,
                toValue,
                toToken.usdPrice,
                toToken.decimals
              )
            : '';
          if (isFiat) {
            setToInputTkn(toValue);
            setToInputFiat(toValueFiat);
          } else {
            setToInputTkn(toValue);
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

  const filteredTokens = useMemo(
    () => tokens.filter((t) => t.address !== from && t.address !== to),
    [from, to, tokens]
  );

  const onTokenChange = useCallback(() => {
    void onFromDebounce(fromInputTkn);
    setFromInputFiat(
      calcOppositeValue(
        false,
        fromInputTkn,
        fromToken?.usdPrice ?? '',
        fromToken?.decimals ?? 0
      )
    );
  }, [fromInputTkn, fromToken?.decimals, fromToken?.usdPrice, onFromDebounce]);

  const fromTokenAddressRef = useRef(fromToken?.address);
  const toTokenAddressRef = useRef(toToken?.address);

  useEffect(() => {
    if (toToken?.address !== toTokenAddressRef.current) {
      toTokenAddressRef.current = toToken?.address;
      onTokenChange();
      return;
    }
    if (fromToken?.address !== fromTokenAddressRef.current) {
      fromTokenAddressRef.current = fromToken?.address;
      onTokenChange();
    }
  }, [fromToken?.address, onTokenChange, toToken?.address]);

  return { fromInput, toInput, isLoading, priceImpact, filteredTokens, isV3 };
};
