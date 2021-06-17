import 'components/inputField/InputField.css';
import { classNameGenerator, sanitizeNumberInput } from 'utils/pureFunctions';

interface InputFieldProps {
  input: string;
  setInput: Function;
  placeholder?: string;
  disabled?: boolean;
  format?: boolean;
  bgGrey?: boolean;
  borderGrey?: boolean;
}

export const InputField = ({
  input,
  setInput,
  placeholder,
  format,
  bgGrey,
  borderGrey,
}: InputFieldProps) => {
  const inputFieldStyles = `input-field ${classNameGenerator({
    'input-field-bg-grey': bgGrey,
    'input-field-border': borderGrey,
  })}`;

  const handleChange = (text: string) => {
    if (format) setInput(sanitizeNumberInput(text));
    else setInput(text);
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
