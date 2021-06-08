import { useState } from 'react';
import { classNameGenerator, sanitizeNumberInput } from 'utils/pureFunctions';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Token } from 'api/bancor';

import 'components/tokenInputField/TokenInputField.css';
import { Modal } from 'components/modal/Modal';
import { SearchableTokenList } from 'components/searchableTokenList/SearchableTokenList';

interface TokenInputFieldProps {
  label: string;
  initialToken?: Token;
  balance: number;
  balanceUsd: number;
  border?: boolean;
  selectable?: boolean;
}

export const TokenInputField = ({
  label,
  initialToken,
  balance,
  balanceUsd,
  border,
  selectable,
}: TokenInputFieldProps) => {
  const [input, setInput] = useState('');
  const [token, setToken] = useState(initialToken);
  const [isOpen, setIsOpen] = useState(false);
  const handleChange = (text: string) => setInput(sanitizeNumberInput(text));

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
          <div className="bg-grey-2 rounded-full h-24 w-24"></div>
          <span className="text-20 mx-6">{token?.symbol}</span>
          {selectable && <FontAwesomeIcon icon={faChevronDown} />}
        </div>

        <div className="relative w-full">
          <div className="absolute text-12 bottom-0 right-0 mr-[22px] mb-10">
            ~$123.56
          </div>
          <input
            type="number"
            value={input}
            placeholder={placeholder}
            className={inputFieldStyles}
            onChange={(event) => handleChange(event.target.value)}
          />
        </div>
      </div>
      <Modal title="Select a Token" isOpen={isOpen} setIsOpen={setIsOpen}>
        <SearchableTokenList
          onClick={(token: Token) => {
            setToken(token);
            setIsOpen(false);
          }}
        />
      </Modal>
    </div>
  );
};
