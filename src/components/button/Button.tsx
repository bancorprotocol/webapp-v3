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
