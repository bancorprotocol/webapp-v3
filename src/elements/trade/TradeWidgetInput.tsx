import { useAppSelector } from 'store/index';
import { useTokenInputV3Return } from 'elements/trade/useTknFiatInput';
import { Image } from 'components/image/Image';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { useMemo, useRef, useState } from 'react';
import { TokenMinimal } from 'services/observables/tokens';
import { SearchableTokenList } from 'components/searchableTokenList/SearchableTokenList';
import { ReactComponent as IconChevron } from 'assets/icons/chevronDown.svg';
import { classNameGenerator } from 'utils/pureFunctions';
import { TokenCurrency } from 'store/user/user';

interface Props {
  input?: useTokenInputV3Return;
  isLoading?: boolean;
  onFocus?: () => void;
  label?: string;
  tokens?: TokenMinimal[];
  onTokenSelect?: (token: TokenMinimal) => void;
  disabled?: boolean;
  errorMsg?: string;
  excludedTokens?: string[];
  includedTokens?: string[];
  disableSelection?: boolean;
}

export const TradeWidgetInput = ({
  input,
  isLoading,
  onFocus,
  label,
  tokens,
  onTokenSelect,
  disabled,
  errorMsg,
  excludedTokens,
  includedTokens,
  disableSelection,
}: Props) => {
  const tokenCurrency = useAppSelector((state) => state.user.tokenCurrency);
  const isCurrency = tokenCurrency === TokenCurrency.Currency;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const value = useMemo(() => {
    if (!input) return '';
    return isCurrency ? input.inputFiat : input.inputTkn;
  }, [input, isCurrency]);

  const handleFocusChange = (state: boolean) => {
    if (state) {
      onFocus && onFocus();
      inputRef.current?.focus();
    } else {
      inputRef.current?.blur();
    }
    setIsFocused(state);
  };

  return (
    <>
      <div>
        <div className="flex justify-between px-10 mb-10 text-secondary">
          {label && <div>{label}</div>}
          {input?.token &&
            input?.token.balance &&
            Number(input?.token.balance) > 0 && (
              <button
                onClick={() => {
                  if (!disabled && input)
                    if (input.token.balanceUsd && isCurrency)
                      input.handleChange(input.token.balanceUsd.toString());
                    else if (input.token.balance && !isCurrency)
                      input.handleChange(input.token.balance.toString());
                }}
                className={`flex items-center ${
                  disabled
                    ? 'cursor-text'
                    : 'hover:text-primary transition-colors duration-300'
                }`}
              >
                Balance: {prettifyNumber(input?.token.balance)} (
                {prettifyNumber(input?.token.balanceUsd ?? 0, true)})
                {!disabled && (
                  <span
                    className={
                      'bg-primary/20 text-primary ml-5 px-6 py-2 rounded-10 text-10'
                    }
                  >
                    Max
                  </span>
                )}
              </button>
            )}
        </div>

        <div
          className={`border ${
            isFocused ? 'border-primary' : 'border-fog dark:border-grey'
          } ${
            errorMsg ? 'border-error dark:border-error' : ''
          } rounded-20 px-20 h-[75px] flex items-center bg-white dark:bg-charcoal space-x-20`}
        >
          {tokens && !tokens.length && (
            <div className="flex items-center space-x-10">
              <div className="loading-skeleton h-40 w-40 !rounded-full" />
              <div className="loading-skeleton h-20 w-[80px]" />
            </div>
          )}
          <div className="flex-none">
            {input && (
              <button
                className={`flex items-center space-x-10 hover:text-primary transition-colors duration-300 ${classNameGenerator(
                  {
                    'cursor-default': disableSelection,
                  }
                )}`}
                onClick={(e) => {
                  if (!disableSelection) {
                    e.preventDefault();
                    setIsOpen(true);
                  }
                }}
              >
                <Image
                  alt={'Token Logo'}
                  className={'w-40 h-40 rounded-full'}
                  src={input.token.logoURI}
                />
                <div className="text-20">{input.token.symbol}</div>
                {!disableSelection && <IconChevron className={'w-12'} />}
              </button>
            )}

            {tokens && !!tokens.length && !input && (
              <button
                onClick={() => {
                  setIsOpen(true);
                }}
                className="h-[75px] text-primary text-20 flex uppercase font-medium items-center space-x-10"
              >
                <div>Select a Token</div>
                <IconChevron className={'w-12'} />
              </button>
            )}
          </div>
          {
            <div
              onClick={() => handleFocusChange(true)}
              className="flex flex-col justify-center flex-grow h-full text-right cursor-text"
            >
              {!isLoading && input ? (
                <>
                  <input
                    ref={inputRef}
                    type="text"
                    value={
                      isFocused
                        ? value
                        : value
                        ? prettifyNumber(value, isCurrency)
                        : ''
                    }
                    className="w-full text-right bg-white outline-none text-20 dark:bg-charcoal"
                    onChange={(e) => {
                      !disabled && input.handleChange(e.target.value);
                    }}
                    placeholder={'0.00'}
                    onFocus={() => handleFocusChange(true)}
                    onBlur={() => handleFocusChange(false)}
                  />
                  {toBigNumber(input.inputTkn).plus(input.inputFiat).gt(0) && (
                    <div className="text-secondary text-12">
                      {prettifyNumber(
                        !isCurrency ? input.inputFiat : input.inputTkn,
                        !isCurrency
                      )}{' '}
                      {input.oppositeUnit}
                    </div>
                  )}
                </>
              ) : (
                tokens &&
                (!tokens.length || (isLoading && input)) && (
                  <div className="flex flex-col items-end">
                    <div className="w-3/4 mb-4 loading-skeleton h-18" />
                    <div className="w-1/2 h-12 loading-skeleton" />
                  </div>
                )
              )}
            </div>
          }
        </div>
        {errorMsg && (
          <div className="relative flex justify-end mr-10">
            <div className="absolute mt-5 text-error">{errorMsg}</div>
          </div>
        )}
      </div>
      {tokens && onTokenSelect && (
        <SearchableTokenList
          onClick={onTokenSelect}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          tokens={tokens}
          limit
          excludedTokens={excludedTokens}
          includedTokens={includedTokens}
        />
      )}
    </>
  );
};
