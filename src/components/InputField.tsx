import { useState } from 'react';

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
        className="focus:outline-none focus:border-blue-300 border-2 border-gray-600 rounded px-4 h-10"
        onChange={(event) => handleChange(event.target.value)}
      />
    </>
  );
};
