import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import 'components/tokenInputField/TokenInputField.css';
import { useState } from 'react';
import {
  classNameGenerator,
  sanitizeNumberInput,
} from '../../utils/pureFunctions';

interface TokenInputFieldProps {
  label: string;
  balance: number;
  balanceUsd: number;
  border?: boolean;
}

export const TokenInputField = ({
  label,
  balance,
  balanceUsd,
  border,
}: TokenInputFieldProps) => {
  const [input, setInput] = useState('');
  const handleChange = (text: string) => setInput(sanitizeNumberInput(text));

  const placeholder = 'Enter token amount';
  const inputFieldStyles = `token-input-field ${classNameGenerator({
    'input-field-bg-grey': border,
  })}`;

  return (
    <div>
      <div className="flex justify-between pr-10">
        <span className="font-medium">{label}</span>
        <span className="text-12">
          Balance: {balance}{' '}
          <span className="text-primary">(~${balanceUsd})</span>
        </span>
      </div>

      <div className="flex items-center">
        <div className="flex items-center mr-24">
          <div className="bg-grey-2 rounded-full h-24 w-24">&#8203;</div>
          <span className="text-20 mx-6">{}</span>
          <FontAwesomeIcon icon={faChevronDown} />
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
    </div>
  );
};
