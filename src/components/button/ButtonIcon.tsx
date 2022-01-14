import { ButtonHTMLAttributes } from 'react';
import { classNameGenerator } from '../../utils/pureFunctions';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  secondary?: boolean;
  animate?: boolean;
  onClick?: () => void;
}

export const ButtonIcon = ({
  className = '',
  secondary = false,
  animate = false,
  ...props
}: ButtonProps) => {
  const variant = secondary ? 'btn-secondary' : 'btn-primary';
  return (
    <button
      type="button"
      {...props}
      className={`btn ${variant} p-0 h-[35px] w-[35px] rounded-[12px] ${className}`}
    >
      <div
        className={`p-[7px] ${classNameGenerator({
          'hover:rotate-180 transition-transform duration-300': animate,
        })}`}
      >
        {props.children}
      </div>
    </button>
  );
};
