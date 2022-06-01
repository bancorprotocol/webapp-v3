import { useAppSelector } from 'store/index';
import { useTokenInputV3Return } from 'elements/trade/useTknFiatInput';
import { Image } from 'components/image/Image';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { useMemo, useRef, useState } from 'react';
import { Token } from 'services/observables/tokens';
import { SearchableTokenList } from 'components/searchableTokenList/SearchableTokenList';
import { ReactComponent as IconChevron } from 'assets/icons/chevronDown.svg';

interface Props {
  input?: useTokenInputV3Return;
  isLoading?: boolean;
  onFocus?: () => void;
  label?: string;
  tokens: Token[];
  onTokenSelect: (token: Token) => void;
  disabled?: boolean;
  errorMsg?: string;
  excludedTokens?: string[];
  includedTokens?: string[];
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
}: Props) => {
  const isFiat = useAppSelector((state) => state.user.usdToggle);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const value = useMemo(() => {
    if (!input) return '';
    return isFiat ? input.inputFiat : input.inputTkn;
  }, [input, isFiat]);

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
        <div className="mb-10 text-secondary flex justify-between px-10">
          {label && <div>{label}</div>}
          {input?.token &&
            input?.token.balance &&
            Number(input?.token.balance) > 0 && (
              <button
                onClick={() =>
                  !disabled && input?.handleChange(input?.token.balance ?? '')
                }
                className={`${
                  disabled
                    ? 'cursor-text'
                    : 'hover:text-primary transition-colors duration-300'
                }`}
              >
                Balance: {prettifyNumber(input?.token.balance)} (
                {prettifyNumber(input?.token.balanceUsd ?? 0, true)})
              </button>
            )}
        </div>

        <div
          className={`border ${
            isFocused ? 'border-primary' : 'border-fog dark:border-grey'
          } ${
            errorMsg ? 'border-error' : ''
          } rounded-20 px-20 h-[75px] flex items-center bg-white dark:bg-charcoal space-x-20`}
        >
          {!tokens.length && (
            <div className="flex items-center space-x-10">
              <div className="loading-skeleton h-40 w-40 !rounded-full" />
              <div className="loading-skeleton h-20 w-[80px]" />
            </div>
          )}
          <div className="flex-none">
            {input && (
              <button
                className="flex items-center space-x-10 hover:text-primary transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(true);
                }}
              >
                <Image
                  alt={'Token Logo'}
                  className={'w-40 h-40 rounded-full'}
                  src={input.token.logoURI}
                />
                <div className="text-20">{input.token.symbol}</div>
                <IconChevron className={'w-12'} />
              </button>
            )}

            {!!tokens.length && !input && (
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
              className="text-right cursor-text h-full flex-grow flex justify-center flex-col"
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
                        ? prettifyNumber(value, isFiat)
                        : ''
                    }
                    className="w-full text-right text-20 outline-none bg-white dark:bg-charcoal"
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
                        !isFiat ? input.inputFiat : input.inputTkn,
                        !isFiat
                      )}{' '}
                      {input.oppositeUnit}
                    </div>
                  )}
                </>
              ) : (
                (!tokens.length || (isLoading && input)) && (
                  <div className="flex flex-col items-end">
                    <div className="loading-skeleton h-18 mb-4 w-3/4" />
                    <div className="loading-skeleton h-12 w-1/2" />
                  </div>
                )
              )}
            </div>
          }
        </div>
        {errorMsg && (
          <div className="relative flex justify-end mr-10">
            <div className="absolute text-error mt-5">{errorMsg}</div>
          </div>
        )}
      </div>

      <SearchableTokenList
        onClick={onTokenSelect}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        tokens={tokens}
        limit
        excludedTokens={excludedTokens}
        includedTokens={includedTokens}
      />
    </>
  );
};
