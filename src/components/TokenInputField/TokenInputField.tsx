import { useState } from 'react';
import 'components/TokenInputField/TokenInputField.css';
import { InputField } from '../InputField/InputField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';

interface TokenInputFieldProps {
  label: string;
  balance: number;
  balanceUsd: number;
  dualInput?: boolean;
  bgGrey?: boolean;
}

export const TokenInputField = ({
  label,
  balance,
  balanceUsd,
  dualInput,
  bgGrey,
}: TokenInputFieldProps) => {
  const placeholder = 'Enter token amount';
  const placeholderUsd = 'Enter dollar amount';

  const InputAmount = () => {
    if (dualInput) {
      return <div>dual input</div>;
    }
    return <InputField format placeholder={placeholder} bgGrey={bgGrey} />;
  };

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
          <div className="bg-grey-2 rounded-full h-24 w-24"></div>
          <span className="text-20 mx-6">BNT</span>
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
        <InputAmount />
      </div>
    </div>
  );
};
