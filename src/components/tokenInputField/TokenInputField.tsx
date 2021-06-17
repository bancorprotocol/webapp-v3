import { useState } from 'react';
import { classNameGenerator, sanitizeNumberInput } from 'utils/pureFunctions';
import { Modal } from 'components/modal/Modal';
import { SearchableTokenList } from 'components/searchableTokenList/SearchableTokenList';
import { ViewToken } from 'redux/bancorAPI/bancorAPI';
import { TokenListItem } from 'observables/tokenList';

import arrowDown from 'assets/icons/arrowDown.svg';
import 'components/tokenInputField/TokenInputField.css';

interface TokenInputFieldProps {
  label: string;
  balance: number;
  balanceUsd: number;
  border?: boolean;
  selectable?: boolean;
  disabled?: boolean;
  input: string;
  setInput?: Function;
  onChange?: Function;
  token: TokenListItem;
  setToken: Function;
  debounce?: Function;
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
}: TokenInputFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleChange = (text: string) => {
    if (setInput) setInput(text);
    if (debounce) debounce(text);
  };

  const placeholder = 'Enter token amount';
  const inputFieldStyles = `token-input-field ${classNameGenerator({
    'input-field-bg-grey': border,
  })}`;

  return (
    <div className={selectable ? 'cursor-pointer' : ''}>
      <div className="flex justify-between pr-10">
        <span className="font-medium">{label}</span>
        <span className="text-12">
          Balance: {balance}{' '}
          <span className="text-primary">(~${balanceUsd})</span>
        </span>
      </div>

      <div className="flex items-center">
        <div
          className="flex items-center mr-24"
          onClick={() => setIsOpen(true)}
        >
          <img
            src={token?.logoURI}
            alt="Token"
            className="bg-grey-2 rounded-full h-24 w-24"
          />
          <span className="text-20 mx-6">{token?.symbol}</span>
          {selectable && <img src={arrowDown} alt="Arrow Down" />}
        </div>

        <div className="relative w-full">
          <div className="absolute text-12 bottom-0 right-0 mr-[22px] mb-10">
            ~$123.56
          </div>
          <input
            type="number"
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
      <Modal title="Select a Token" isOpen={isOpen} setIsOpen={setIsOpen}>
        <SearchableTokenList
          onClick={(token: ViewToken) => {
            setToken(token);
            setIsOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};
