import 'components/inputField/InputField.css';
import {
  classNameGenerator,
  sanitizeNumberInput,
} from '../../utils/pureFunctions';

interface InputFieldProps {
  input: string;
  setInput?: Function;
  placeholder?: string;
  disabled?: boolean;
  format?: boolean;
  bgGrey?: boolean;
  onChange?: Function;
}

export const InputField = ({
  input,
  setInput,
  placeholder,
  disabled,
  format,
  bgGrey,
  onChange,
}: InputFieldProps) => {
  const inputFieldStyles = `input-field ${classNameGenerator({
    'input-field-bg-grey': bgGrey,
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
