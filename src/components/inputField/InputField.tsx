import 'components/inputField/InputField.css';
import {
  classNameGenerator,
  sanitizeNumberInput,
} from '../../utils/pureFunctions';

interface InputFieldProps {
  input: string;
  setInput: Function;
  placeholder?: string;
  disabled?: boolean;
  format?: boolean;
  bgGrey?: boolean;
}

export const InputField = ({
  input,
  setInput,
  placeholder,
  disabled,
  format,
  bgGrey,
}: InputFieldProps) => {
  const inputFieldStyles = `input-field ${classNameGenerator({
    'input-field-bg-grey': bgGrey,
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
