import { ButtonHTMLAttributes, memo } from 'react';

export enum ButtonVariant {
  Primary,
  Secondary,
  Tertiary,
  Error,
  Warning,
}

export enum ButtonSize {
  ExtraLarge,
  Large,
  Meduim,
  Small,
  ExtraSmall,
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const getVariantStyle = (variant: ButtonVariant) => {
  switch (variant) {
    case ButtonVariant.Primary:
      return '';
    case ButtonVariant.Secondary:
      return '';
    case ButtonVariant.Tertiary:
      return '';
    case ButtonVariant.Error:
      return '';
    case ButtonVariant.Warning:
      return '';
  }
};

const getSizeStyle = (size: ButtonSize) => {
  switch (size) {
    case ButtonSize.ExtraLarge:
      return '';
    case ButtonSize.Large:
      return '';
    case ButtonSize.Meduim:
      return '';
    case ButtonSize.Small:
      return '';
    case ButtonSize.ExtraSmall:
      return '';
  }
};

export const Button = memo(
  ({
    variant = ButtonVariant.Primary,
    size = ButtonSize.Large,
    ...props
  }: ButtonProps) => {
    return (
      <button
        {...props}
        className={`${getVariantStyle(variant)} ${getSizeStyle(size)}`}
      >
        {props.children}
      </button>
    );
  }
);

export const ButtonToggle = ({
  labels,
  toggle,
  setToggle,
  onClass = 'bg-white dark:bg-charcoal',
  offClass = 'bg-fog dark:bg-black dark:text-white-low text-black-low',
}: {
  labels: JSX.Element[];
  toggle: boolean;
  setToggle: Function;
  onClass?: string;
  offClass?: string;
}) => {
  return (
    <div className="w-full h-full bg-fog p-5 rounded-[14px] flex items-center dark:bg-black">
      {labels.map((label, index) => (
        <button
          key={label.key}
          className={`rounded-10 ${
            (toggle && index === 0) || (!toggle && index !== 0)
              ? offClass
              : onClass
          }`}
          onClick={() => setToggle()}
        >
          {label}
        </button>
      ))}
    </div>
  );
};
