import { useState } from 'react';
import 'components/inputField/InputField.css';

interface InputFieldProps {
  placeholder?: string;
  disabled?: boolean;
  format?: boolean;
  bgGrey?: boolean;
}

export const InputField = ({
  placeholder,
  disabled,
  format,
  bgGrey,
}: InputFieldProps) => {
  const [input, setInput] = useState('');

  const inputFieldStyles = bgGrey
    ? 'input-field input-field-bg-grey'
    : 'input-field';

  const handleChange = (text: string) => {
    if (!format) setInput(text);

    setInput(
      text
        .replace(/[^\d.]/g, '')
        .replace(/\./, 'x')
        .replace(/\./g, '')
        .replace(/x/, '.')
    );
  };

  return (
    <input
      type="text"
      value={input}
      placeholder={placeholder}
      className={inputFieldStyles}
      onChange={(event) => handleChange(event.target.value)}
    />
  );
};
