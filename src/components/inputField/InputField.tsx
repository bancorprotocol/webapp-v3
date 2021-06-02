import { useState } from 'react';
import 'components/inputField/InputField.css';
import {classNameGenerator, sanitizeNumberInput} from "../../utils/pureFunctions";

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

  const inputFieldStyles = `input-field ${classNameGenerator({ 'input-field-bg-grey': bgGrey })}`

  const handleChange = (text: string) => {
    if (!format) setInput(text);
    setInput(sanitizeNumberInput(text))
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
