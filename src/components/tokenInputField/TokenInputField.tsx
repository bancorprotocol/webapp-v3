import { useState } from 'react';
import { classNameGenerator, sanitizeNumberInput } from 'utils/pureFunctions';
import { SearchableTokenList } from 'components/searchableTokenList/SearchableTokenList';
import { Token } from 'services/observables/tokens';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import 'components/tokenInputField/TokenInputField.css';
import 'components/inputField/InputField.css';
import { prettifyNumber } from 'utils/helperFunctions';
import BigNumber from 'bignumber.js';
import { Image } from 'components/image/Image';
import { useAppSelector } from 'redux/index';

interface TokenInputFieldProps {
  label?: string;
  border?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  input: string;
  setInput?: Function;
  amountUsd?: string;
  setAmountUsd?: Function;
  onChange?: Function;
  token?: Token;
  setToken?: Function;
  debounce?: Function;
  startEmpty?: boolean;
  errorMsg?: string;
  usdSlippage?: number;
  dataCy?: string;
  fieldBalance?: string;
  excludedTokens?: string[];
  includedTokens?: string[];
  isLoading?: boolean;
  balanceLabel?: string;
}

export const TokenInputField = ({
  dataCy,
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
  errorMsg,
  usdSlippage,
  fieldBalance,
  excludedTokens = [],
  includedTokens = [],
  isLoading,
  balanceLabel = 'Balance',
}: TokenInputFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const balance = fieldBalance ? fieldBalance : token ? token.balance : null;
  const balanceUsd =
    token && balance
      ? new BigNumber(balance).times(token.usdPrice ?? 0).toString()
      : null;

  const toggle = useAppSelector<boolean>((state) => state.user.usdToggle);
  const loadingBalances = useAppSelector<boolean>(
    (state) => state.user.loadingBalances
  );
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);

  const onInputChange = (text: string, token?: Token) => {
    text = sanitizeNumberInput(text);
    if (toggle) {
      const tokenAmount = sanitizeNumberInput(
        new BigNumber(text).div(token?.usdPrice!).toString(),
        token?.decimals
      );
      if (setAmountUsd) setAmountUsd(text !== 'NaN' ? text : '');
      if (onChange) onChange(tokenAmount);
      else {
        if (setInput) setInput(tokenAmount);
        if (debounce) debounce(tokenAmount);
      }
    } else {
      const usdAmount = new BigNumber(text).times(token?.usdPrice!).toString();
      if (setAmountUsd)
        setAmountUsd(usdAmount !== '0' && usdAmount !== 'NaN' ? usdAmount : '');
      const val = sanitizeNumberInput(text, token?.decimals);
      if (onChange) onChange(val);
      else {
        if (setInput) setInput(val);
        if (debounce) debounce(val);
      }
    }
  };

  const inputValue = () => {
    if (!toggle && !disabled) return input;
    if (!toggle && disabled) return `${sanitizeNumberInput(input, 6)}`;
    if (!amountUsd) return '';
    return `~$${sanitizeNumberInput(amountUsd, 6)}`;
  };

  const convertedAmount = () => {
    const prefix = toggle ? '' : '~';
    const tokenAmount = prettifyNumber(input);
    const usdAmount = prettifyNumber(amountUsd ?? 0, true);
    const amount = toggle ? tokenAmount : usdAmount;

    if ((input || amountUsd) && token) return `${prefix}${amount}`;
    else return `${prefix}${toggle ? '' : '$'}0`;
  };

  const setMaxAmount = () => {
    if (balance && balanceUsd && token) {
      if (token.symbol === 'ETH') {
        const reducedBalance = new BigNumber(balance).minus(0.01).toString();
        const reducedUsdBalance = new BigNumber(reducedBalance)
          .times(token.usdPrice!)
          .toString();
        onInputChange(toggle ? reducedUsdBalance : reducedBalance, token);
      } else onInputChange(toggle ? balanceUsd : balance, token);
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
        {loadingBalances && token ? (
          <div className="loading-skeleton h-[20px] w-[140px]"></div>
        ) : (
          balance &&
          balanceUsd &&
          token && (
            <button
              onClick={() => setMaxAmount()}
              disabled={disabled}
              className={`text-12 focus:outline-none ${classNameGenerator({
                'cursor-not-allowed': disabled,
              })}`}
            >
              {balanceLabel}: {prettifyNumber(balance)}
              <span className="text-primary ml-4">
                (~{prettifyNumber(balanceUsd, true)})
              </span>
            </button>
          )
        )}
      </div>
      {startEmpty && !token ? (
        <button
          data-cy="selectTokenButton"
          onClick={() => (selectable ? setIsOpen(true) : {})}
          className="flex items-center text-primary font-medium text-20 mt-10 mb-30 py-5"
        >
          Select a token
          <IconChevronDown className="w-[10px] h-[6px] ml-10" />
        </button>
      ) : (
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
                <Image
                  src={token.logoURI}
                  alt="Token"
                  className="bg-grey-2 rounded-full h-28 w-28"
                />
                <span className="text-20 mx-10">{token.symbol}</span>
              </>
            ) : (
              <>
                <div className="loading-skeleton h-28 w-28"></div>
                <div className="loading-skeleton mx-10 h-16 w-50"></div>
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
              <div className="absolute text-12 bottom-0 right-0 w-full">
                {isLoading ? (
                  <div className="flex flex-col items-end right-[15px] bottom-12 absolute w-4/5 bg-white dark:bg-blue-4 ">
                    <div className="loading-skeleton h-[22px] w-full mb-[8px]"></div>
                    <div className="loading-skeleton h-12 w-80 mr-2"></div>
                  </div>
                ) : (
                  <div className="text-right mr-[22px] mb-10">
                    {convertedAmount()} {toggle && token?.symbol}
                    {!usdSlippage ||
                      (usdSlippage !== 0 && (
                        <span className="text-grey-3 ml-4">
                          ({usdSlippage}%)
                        </span>
                      ))}
                  </div>
                )}
              </div>
              <input
                data-cy={dataCy}
                type="text"
                inputMode="decimal"
                value={inputValue()}
                disabled={disabled}
                placeholder={toggle ? '~$0.00' : '0.00'}
                className={inputFieldStyles}
                onChange={(event) => onInputChange(event.target.value, token)}
              />
            </div>
            {errorMsg && (
              <div className="text-error text-12 px-10 pt-5">{errorMsg}</div>
            )}
          </div>
        </div>
      )}

      <SearchableTokenList
        onClick={(token: Token) => {
          if (setToken) setToken(token);
          onInputChange(inputValue(), token);
        }}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        tokens={tokens}
        excludedTokens={excludedTokens}
        includedTokens={includedTokens}
      />
    </div>
  );
};
