import { useContext, useState } from 'react';
import {
  classNameGenerator,
  sanitizeNumberInput,
  usdByToken,
} from 'utils/pureFunctions';
import { SearchableTokenList } from 'components/searchableTokenList/SearchableTokenList';
import { getTokenLogoURI, TokenListItem } from 'services/observables/tokens';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import 'components/tokenInputField/TokenInputField.css';
import 'components/inputField/InputField.css';
import { Toggle } from 'elements/swapWidget/SwapWidget';
import { prettifyNumber } from 'utils/helperFunctions';

interface TokenInputFieldProps {
  label: string;
  balance: string | null;
  balanceUsd: string | null;
  border?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  input: string;
  setInput?: Function;
  onChange?: Function;
  token: TokenListItem | null;
  setToken: Function;
  debounce?: Function;
  startEmpty?: boolean;
}

export const TokenInputField = ({
  label,
  balance,
  balanceUsd,
  border,
  selectable,
  token,
  setToken,
  input,
  setInput,
  onChange,
  disabled,
  debounce,
  startEmpty,
}: TokenInputFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSelectToken, setSelectToken] = useState(!!startEmpty);

  const toggle = useContext(Toggle);
  const handleChange = (text: string) => {
    if (setInput) setInput(text);
    if (debounce) debounce(text);
  };

  const placeholder = '0.0';
  const inputFieldStyles = `token-input-field ${classNameGenerator({
    'border-blue-0 dark:border-blue-1': border,
  })}`;

  return (
    <div>
      <div className="flex justify-between pr-10">
        <span className="font-medium">{label}</span>
        {balance && balanceUsd && token && (
          <button
            onClick={() => handleChange(balance.toString())}
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
        <div className="flex items-center">
          <div
            className={`flex items-center min-w-[135px] ${classNameGenerator({
              'cursor-pointer': selectable,
            })}`}
            onClick={() => setIsOpen(true)}
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

          <div className="relative w-full">
            <div className="absolute text-12 bottom-0 right-0 mr-[22px] mb-10">
              {`${!toggle && '~'}${
                input !== '' && token
                  ? prettifyNumber(usdByToken(token, input, !toggle), true)
                  : '0.00'
              }`}
            </div>
            <input
              type="text"
              value={input}
              disabled={disabled}
              placeholder={placeholder}
              className={inputFieldStyles}
              onChange={(event) => {
                const val = sanitizeNumberInput(event.target.value);
                onChange ? onChange(val) : handleChange(val);
              }}
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center text-primary uppercase font-semibold text-20 mt-10 mb-30 py-5"
        >
          Select a Token
          <IconChevronDown className="w-[10px] h-[6px] ml-10" />
        </button>
      )}

      <SearchableTokenList
        onClick={(token: TokenListItem) => {
          setToken(token);
          setIsOpen(false);
          setSelectToken(false);
        }}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </div>
  );
};
