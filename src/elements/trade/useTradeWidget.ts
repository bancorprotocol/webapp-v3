import PQueue from 'p-queue';
import { TokenMinimal } from 'services/observables/tokens';
import { useAppSelector } from 'store/index';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getRateAndPriceImapct } from 'services/web3/swap/market';
import { calcOppositeValue } from 'components/tokenInput/useTokenInputV3';
import {
  useTknFiatInput,
  useTokenInputV3Return,
} from 'elements/trade/useTknFiatInput';
import { toBigNumber } from 'utils/helperFunctions';
import { ethToken, wethToken } from 'services/web3/config';
import {
  fetchZeroExTokenBalance,
  getZeroExRateAndPriceImpact,
} from 'services/web3/swap/zeroEx';
import { useInterval } from 'hooks/useInterval';
import { TokenCurrency } from 'store/user/user';

const queue = new PQueue({ concurrency: 1 });

interface UseTradeWidgetProps {
  from?: string;
  to?: string;
  tokens: TokenMinimal[];
}

export interface UseTradeWidgetReturn {
  isLoading: boolean;
  fromInput: useTokenInputV3Return | undefined;
  toInput: useTokenInputV3Return | undefined;
  priceImpact: string;
  filteredTokens: TokenMinimal[];
  isV3: boolean;
  isExternal: boolean;
}

export const useTradeWidget = ({
  from,
  to,
  tokens,
}: UseTradeWidgetProps): UseTradeWidgetReturn => {
  const account = useAppSelector((state) => state.user.account);
  const tokenCurrency = useAppSelector((state) => state.user.tokenCurrency);
  const isCurrency = tokenCurrency === TokenCurrency.Currency;
  const forceV3Routing = useAppSelector((state) => state.user.forceV3Routing);

  const [fromInputTkn, setFromInputTkn] = useState('');
  const [fromInputFiat, setFromInputFiat] = useState('');

  const [toInputTkn, setToInputTkn] = useState('');
  const [toInputFiat, setToInputFiat] = useState('');

  const [fromTokenExternal, setFromTokenExternal] = useState<
    Partial<TokenMinimal>
  >({});
  const [toTokenExternal, setToTokenExternal] = useState<Partial<TokenMinimal>>(
    {}
  );

  const [priceImpact, setPriceImpact] = useState('0.0000');
  const [isV3, setIsV3] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);

  const tokensMap = useMemo(
    () => new Map(tokens.map((token) => [token.address, token])),
    [tokens]
  );

  const fromToken = useMemo(() => {
    const tkn = tokensMap.get(from ?? '');
    if (tkn && !!tkn.isExternal) {
      return { ...tkn, ...fromTokenExternal };
    }
    return tkn;
  }, [from, fromTokenExternal, tokensMap]);

  const toToken = useMemo(() => {
    const tkn = tokensMap.get(to ?? '');
    if (tkn && !!tkn.isExternal) {
      return { ...tkn, ...toTokenExternal };
    }
    return tkn;
  }, [to, toTokenExternal, tokensMap]);

  const fetchExternalBalances = useCallback(async () => {
    if (!account) {
      return;
    }
    const ethUsdPrice = tokensMap.get(ethToken)?.usdPrice ?? '0';

    if (!!fromToken?.isExternal) {
      setFromTokenExternal(
        await fetchZeroExTokenBalance(
          account,
          fromToken.address,
          fromToken.decimals,
          ethUsdPrice
        )
      );
    }

    if (!!toToken?.isExternal) {
      setToTokenExternal(
        await fetchZeroExTokenBalance(
          account,
          toToken.address,
          toToken.decimals,
          ethUsdPrice
        )
      );
    }
  }, [
    tokensMap,
    account,
    fromToken?.address,
    fromToken?.isExternal,
    fromToken?.decimals,
    toToken?.address,
    toToken?.isExternal,
    toToken?.decimals,
  ]);

  useInterval(fetchExternalBalances, 5000);

  const isExternal = !!fromToken?.isExternal || !!toToken?.isExternal;

  const handleRateAndPriceImpact = useCallback(
    async (val: string, fromToken: TokenMinimal, toToken: TokenMinimal) => {
      if (isExternal && val) {
        return await getZeroExRateAndPriceImpact({
          from: { ...fromToken },
          to: { ...toToken },
          value: val,
        });
      }
      if (fromToken.address === wethToken) {
        return { rate: val, priceImpact: '0', isV3: true };
      }
      if (val) {
        return await getRateAndPriceImapct(
          fromToken,
          toToken,
          val,
          forceV3Routing
        );
      }

      return { rate: '', priceImpact: '', isV3: true };
    },
    [forceV3Routing, isExternal]
  );

  const onFromDebounce = useCallback(
    async (val: string) => {
      if (!fromToken || !toToken) return;
      queue.clear();
      await queue.add(async () => {
        if (queue.size !== 0) return;
        setIsLoading(!!val);
        try {
          const { rate, priceImpact, isV3 } = await handleRateAndPriceImpact(
            val,
            fromToken,
            toToken
          );

          setPriceImpact(priceImpact);
          setIsV3(isV3);

          const toValue =
            toBigNumber(rate).isZero() || isNaN(Number(rate)) ? '' : rate;

          const toValueFiat = toValue
            ? calcOppositeValue(
                false,
                toValue,
                toToken.usdPrice ?? null,
                toToken.decimals
              )
            : '';
          if (isCurrency) {
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
    [fromToken, handleRateAndPriceImpact, isCurrency, toToken]
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

  return {
    fromInput,
    toInput,
    isLoading,
    priceImpact,
    filteredTokens,
    isV3,
    isExternal,
  };
};
