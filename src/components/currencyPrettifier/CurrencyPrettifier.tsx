import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { TokenMinimal } from 'services/observables/tokens';
import { ethToken } from 'services/web3/config';
import { useAppSelector } from 'store';
import { getTradeTokensWithExternal } from 'store/bancor/bancor';
import { BaseCurrency } from 'store/user/user';
import { prettifyNumber } from 'utils/helperFunctions';

export const CurrencyPrettifier = ({
  isCurrency,
  amount,
}: {
  isCurrency: boolean;
  amount: string;
}) => {
  const tokens = useAppSelector<TokenMinimal[]>(getTradeTokensWithExternal);
  const baseCurrency = useAppSelector((state) => state.user.baseCurrency);
  const tokensMap = useMemo(
    () => new Map(tokens.map((token) => [token.address, token])),
    [tokens]
  );
  const isUSD = baseCurrency === BaseCurrency.USD;
  const ethUsdPrice = tokensMap.get(ethToken)?.usdPrice ?? '0';
  const currencyAmount = isUSD
    ? amount
    : new BigNumber(amount).times(new BigNumber(1).div(ethUsdPrice));

  return isCurrency ? (
    <>
      {prettifyNumber(currencyAmount, isUSD)} {!isUSD && 'ETH'}
    </>
  ) : (
    <>{prettifyNumber(amount, false)}</>
  );
};
