import { useContext, useState } from 'react';
import { classNameGenerator, sanitizeNumberInput } from 'utils/pureFunctions';
import { SearchableTokenList } from 'components/searchableTokenList/SearchableTokenList';
import { getTokenLogoURI, TokenListItem } from 'services/observables/tokens';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import 'components/tokenInputField/TokenInputField.css';
import 'components/inputField/InputField.css';
import { Toggle } from 'elements/swapWidget/SwapWidget';
import { prettifyNumber } from 'utils/helperFunctions';
import BigNumber from 'bignumber.js';

interface TokenInputFieldProps {
  label: string;
  border?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  input: string;
  setInput?: Function;
  amountUsd: string;
  setAmountUsd: Function;
  onChange?: Function;
  token: TokenListItem | null;
  setToken: Function;
  debounce?: Function;
  startEmpty?: boolean;
  excludedTokens?: string[];
  errorMsg?: string;
  usdSlippage?: number;
}

export const TokenInputField = ({
  label,
  border,
  selectable,
  token,
  setToken,
  input,
  setInput,
  amountUsd,
  setAmountUsd,
  onChange,
  disabled,
  debounce,
  startEmpty,
  excludedTokens = [],
  errorMsg,
  usdSlippage,
}: TokenInputFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSelectToken, setSelectToken] = useState(!!startEmpty);

  const balance = token ? token.balance : null;
  const balanceUsd =
    token && balance
      ? new BigNumber(balance).times(token.usdPrice ?? 0).toString()
      : null;

  const toggle = useContext(Toggle);

  const onInputChange = (text: string) => {
    text = sanitizeNumberInput(text);
    if (toggle) {
      const tokenAmount = sanitizeNumberInput(
        new BigNumber(text).div(token?.usdPrice!).toString(),
        token?.decimals
      );
      setAmountUsd(text !== 'NaN' ? text : '');
      if (onChange) onChange(tokenAmount);
      else {
        if (setInput) setInput(tokenAmount);
        if (debounce) debounce(tokenAmount);
      }
    } else {
      const usdAmount = new BigNumber(text).times(token?.usdPrice!).toString();
      setAmountUsd(usdAmount !== '0' && usdAmount !== 'NaN' ? usdAmount : '');
      const val = sanitizeNumberInput(text, token?.decimals);
      if (onChange) onChange(val);
      else {
        if (setInput) setInput(val);
        if (debounce) debounce(val);
      }
    }
  };

  const inputFieldStyles = `token-input-field ${classNameGenerator({
    'border-blue-0 dark:border-blue-1': border,
    '!border-error': errorMsg,
  })}`;

  return (
    <div>
      <div className="flex justify-between pr-10 mb-4">
        <span className="font-medium">{label}</span>
        {balance && balanceUsd && token && (
          <button
            onClick={() => onInputChange(toggle ? balanceUsd : balance)}
            className="text-12 cursor-pointer focus:outline-none"
          >
            Balance: {prettifyNumber(balance)}
            <span className="text-primary ml-4">
              (~{prettifyNumber(balanceUsd, true)})
            </span>
          </button>
        )}
      </div>
      {!showSelectToken || token ? (
        <div className="flex items-start">
          <div
            className={`flex items-center mt-15 min-w-[135px] ${classNameGenerator(
              {
                'cursor-pointer': selectable,
              }
            )}`}
            onClick={() => (selectable ? setIsOpen(true) : {})}
          >
            {token ? (
              <>
                <img
                  src={getTokenLogoURI(token)}
                  alt="Token"
                  className="bg-grey-2 rounded-full h-28 w-28"
                />
                <span className="text-20 mx-10">{token.symbol}</span>
              </>
            ) : (
              <>
                <div className="bg-grey-2 rounded-full h-28 w-28 animate-pulse"></div>
                <div className="mx-10 h-16 w-50 bg-grey-2 animate-pulse rounded-full"></div>
              </>
            )}

            {selectable && (
              <div>
                <IconChevronDown className="w-[10px] h-[6px] mr-10 text-grey-4 dark:text-grey-3" />
              </div>
            )}
          </div>
          <div className="w-full">
            <div className="relative w-full">
              <div className="absolute text-12 bottom-0 right-0 mr-[22px] mb-10">
                {`${!toggle ? '~' : ''}${
                  (input !== '' || amountUsd !== '') && token
                    ? prettifyNumber(!toggle ? amountUsd : input, !toggle)
                    : '0.00'
                }`}{' '}
                {!toggle && usdSlippage && (
                  <span className="text-grey-3">({usdSlippage}%)</span>
                )}
              </div>
              <input
                type="text"
                value={
                  toggle
                    ? amountUsd
                      ? `$${sanitizeNumberInput(amountUsd, 2)}`
                      : ''
                    : input
                }
                disabled={disabled}
                placeholder={toggle ? '$0.00' : '0.00'}
                className={inputFieldStyles}
                onChange={(event) => onInputChange(event.target.value)}
              />
            </div>
            {errorMsg && (
              <div className="text-error text-12 px-10 pt-5">{errorMsg}</div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => (selectable ? setIsOpen(true) : {})}
          className="flex items-center text-primary uppercase font-semibold text-20 mt-10 mb-30 py-5"
        >
          Select a Token
          <IconChevronDown className="w-[10px] h-[6px] ml-10" />
        </button>
      )}

      <SearchableTokenList
        onClick={(token: TokenListItem) => {
          setToken(token);
          setSelectToken(false);
        }}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        excludedTokens={excludedTokens}
      />
    </div>
  );
};
