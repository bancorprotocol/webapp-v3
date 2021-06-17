import 'components/inputField/InputField.css';
import { classNameGenerator, sanitizeNumberInput } from 'utils/pureFunctions';

interface InputFieldProps {
  input: string;
  setInput?: Function;
  placeholder?: string;
  disabled?: boolean;
  format?: boolean;
  bgGrey?: boolean;
  borderGrey?: boolean;
  onChange?: Function;
}

export const InputField = ({
  input,
  setInput,
  placeholder,
  format,
  bgGrey,
  borderGrey,
  onChange,
}: InputFieldProps) => {
  const inputFieldStyles = `input-field ${classNameGenerator({
    'input-field-bg-grey': bgGrey,
    'input-field-border': borderGrey,
    'text-right': format,
  })}`;

  return (
    <input
      type="text"
      value={input}
      placeholder={placeholder}
      className={inputFieldStyles}
      onChange={(event) => {
        const val = format
          ? sanitizeNumberInput(event.target.value)
          : event.target.value;
        onChange ? onChange(val) : setInput && setInput(val);
      }}
    />
  );
};
