import { ButtonHTMLAttributes } from 'react';

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  DARK = 'dark',
  LIGHT = 'light',
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
  textBadge?: string;
}

export const Button = ({
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.LARGE,
  className = '',
  outlined = false,
  textBadge,
  ...props
}: ButtonProps) => {
  const btnOutlined = outlined ? 'outline-' : '';
  const btnVariant = `btn-${btnOutlined}${variant}`;
  const btnSize = `btn-${size}`;

  return (
    <button
      type="button"
      {...props}
      className={`btn ${btnVariant} ${btnSize} ${className} relative`}
    >
      {props.children}
      {textBadge && (
        <span className="absolute -top-8 right-0 bg-primary text-white text-10 rounded-full px-6">
          {textBadge}
        </span>
      )}
    </button>
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
