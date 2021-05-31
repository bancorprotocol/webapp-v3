import { useState } from 'react';
import 'components/InputField/InputField.css';

export const InputField = ({
  placeholder,
  disabled,
  format,
}: {
  placeholder?: string;
  disabled?: boolean;
  format?: boolean;
}) => {
  const [input, setInput] = useState('');

  const handleChange = (text: string) => {
    setInput(
      format
        ? text
            .replace(/[^\d.]/g, '')
            .replace(/\./, 'x')
            .replace(/\./g, '')
            .replace(/x/, '.')
        : text
    );
  };

  return (
    <>
      <input
        type="text"
        value={input}
        placeholder={placeholder}
        className="input-field"
        onChange={(event) => handleChange(event.target.value)}
      />
    </>
  );
};
