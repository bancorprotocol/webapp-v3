import { ButtonHTMLAttributes } from 'react';

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
}

export enum ButtonSize {
  LARGE = 'lg',
  MEDIUM = 'md',
  SMALL = 'sm',
  EXTRASMALL = 'xs',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  outlined?: boolean;
  onClick?: () => void;
}

export const Button = ({
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.LARGE,
  className = '',
  outlined = false,
  ...props
}: ButtonProps) => {
  const btnOutlined = outlined ? 'outline-' : '';
  const btnVariant = `btn-${btnOutlined}${variant}`;
  const btnSize = `btn-${size}`;

  return (
    <button
      type="button"
      {...props}
      className={`btn ${btnVariant} ${btnSize} ${className}`}
    />
  );
};

export const ButtonToggle = ({
  labels,
  toggle,
  setToggle,
}: {
  labels: JSX.Element[];
  toggle: boolean;
  setToggle: Function;
}) => {
  return (
    <div className="bg-fog p-5 rounded-10 flex items-center dark:bg-black">
      {labels.map((label, index) => (
        <button
          key={label.key}
          className={`rounded-10 px-12 ${
            (toggle && index === 0) || (!toggle && index !== 0)
              ? 'bg-white dark:bg-charcoal'
              : 'bg-fog dark:bg-black dark:text-white-low text-black-low'
          }`}
          onClick={() => setToggle()}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
