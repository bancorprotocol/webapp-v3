import BigNumber from 'bignumber.js';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { Image } from 'components/image/Image';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { ReactComponent as IconWarning } from 'assets/icons/warning.svg';
import { useAppSelector } from 'store';
import { BaseCurrency, TokenCurrency } from 'store/user/user';
import { CurrencyPrettifier } from 'components/currencyPrettifier/CurrencyPrettifier';
import { getTradeTokensWithExternal } from 'store/bancor/bancor';
import { useMemo } from 'react';
import { TokenMinimal } from 'services/observables/tokens';
import { ethToken } from 'services/web3/config';
interface Props {
  symbol: string;
  amount: string;
  usdPrice: string;
  imgUrl: string;
  deficitAmount?: string;
  abbreviate?: boolean;
}

const AmountWithPopover = ({
  amount,
  symbol,
  options,
}: {
  amount: string;
  symbol?: string;
  options?: {
    usd?: boolean;
    abbreviate?: boolean;
  };
}) => {
  const baseCurrency = useAppSelector((state) => state.user.baseCurrency);
  const isUSD = baseCurrency === BaseCurrency.USD;
  const prettifiedAmount = prettifyNumber(amount, { ...options, usd: isUSD });

  if (!options?.abbreviate || toBigNumber(amount).lte(999999)) {
    return (
      <>
        {prettifiedAmount}
        {!isUSD && ' ETH'}
      </>
    );
  }

  return (
    <PopoverV3
      buttonElement={() => (
        <span className={'uppercase'}>{prettifiedAmount}</span>
      )}
    >
      {prettifyNumber(amount, { ...options, abbreviate: false, usd: isUSD })}{' '}
      {!isUSD && 'ETH'}
      {symbol && symbol}
    </PopoverV3>
  );
};

export const TokenBalance = ({
  symbol,
  amount,
  usdPrice,
  imgUrl,
  deficitAmount,
  abbreviate,
}: Props) => {
  const usdAmount = new BigNumber(amount).times(usdPrice).toString();
  const tokenCurrency = useAppSelector((state) => state.user.tokenCurrency);
  const isToken = tokenCurrency === TokenCurrency.Token;

  const tokens = useAppSelector<TokenMinimal[]>(getTradeTokensWithExternal);
  const baseCurrency = useAppSelector((state) => state.user.baseCurrency);
  const tokensMap = useMemo(
    () => new Map(tokens.map((token) => [token.address, token])),
    [tokens]
  );
  const isUSD = baseCurrency === BaseCurrency.USD;
  const ethUsdPrice = tokensMap.get(ethToken)?.usdPrice ?? '0';
  const currencyAmount = isUSD
    ? usdAmount
    : new BigNumber(usdAmount)
        .times(new BigNumber(1).div(ethUsdPrice))
        .toString();

  return (
    <div className="flex">
      <Image
        alt={`${symbol} Logo`}
        src={imgUrl}
        className="w-40 h-40 mr-10 !rounded-full"
      />
      <div className="flex flex-col items-start">
        <div className="flex items-center gap-5 text-justify text-16">
          {isToken && symbol}{' '}
          <AmountWithPopover
            amount={isToken ? amount : currencyAmount}
            symbol={symbol}
            options={{ abbreviate, usd: !isToken }}
          />
          {deficitAmount && (
            <PopoverV3
              buttonElement={() => <IconWarning className="text-error" />}
            >
              <span className="text-secondary">
                Due to vault deficit, current value is{' '}
                {prettifyNumber(deficitAmount)} {symbol}
              </span>
            </PopoverV3>
          )}
        </div>
        <span className="text-secondary">
          <CurrencyPrettifier
            amount={isToken ? currencyAmount : amount}
            isCurrency={isToken}
          />{' '}
          {!isToken && symbol}
        </span>
      </div>
    </div>
  );
};
