import { ButtonHTMLAttributes, memo } from 'react';

export enum ButtonVariant {
  Primary,
  Secondary,
  Tertiary,
  Error,
  Warning,
}

export enum ButtonSize {
  Full,
  ExtraLarge,
  Large,
  Meduim,
  Small,
  ExtraSmall,
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

const disabledText =
  'disabled:text-black-disabled dark:disabled:text-white-low';

const getVariantStyle = (variant: ButtonVariant) => {
  switch (variant) {
    case ButtonVariant.Primary:
      return `bg-primary hover:bg-primary-dark disabled:bg-fog dark:disabled:bg-grey text-white ${disabledText}`;
    case ButtonVariant.Secondary:
      return `bg-black hover:bg-grey disabled:bg-fog  dark:bg-white dark:hover:bg-silver dark:disabled:bg-grey text-white dark:text-charcoal ${disabledText}`;
    case ButtonVariant.Tertiary:
      return 'bg-fog hover:bg-black disabled:bg-fog text-charcoal hover:text-white dark:bg-grey dark:text-white dark:hover:bg-white dark:hover:text-charcoal disabled:text-black-low dark:disabled:text-white-low dark:disabled:hover:bg-grey';
    case ButtonVariant.Error:
      return '';
    case ButtonVariant.Warning:
      return '';
  }
};

const getSizeStyle = (size: ButtonSize) => {
  switch (size) {
    case ButtonSize.Full:
      return 'w-full h-[53px]';
    case ButtonSize.ExtraLarge:
      return 'w-[428px] h-[53px]';
    case ButtonSize.Large:
      return 'w-[335px] h-[53px]';
    case ButtonSize.Meduim:
      return 'w-[266px] h-[47px]';
    case ButtonSize.Small:
      return 'w-[142px] h-[39px]';
    case ButtonSize.ExtraSmall:
      return 'w-[94px] h-[33px]';
  }
};

export const Button = memo(
  ({
    variant = ButtonVariant.Primary,
    size = ButtonSize.Large,
    className,
    ...props
  }: ButtonProps) => {
    return (
      <button
        {...props}
        className={`rounded-40 disabled:cursor-not-allowed active:scale-95 disabled:scale-100 transition-all duration-300 ${className} ${getVariantStyle(
          variant
        )} ${getSizeStyle(size)}`}
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

export const ButtonPercentages = ({
  percentages,
  onClick,
  selected,
  itemStyle,
}: {
  percentages: number[];
  onClick: (percentage: number) => void;
  selected: number;
  itemStyle?: string;
}) => {
  return (
    <>
      {percentages.map((percentage, index) => (
        <button
          key={percentage}
          className={`w-full rounded-[12px] border ${
            selected === index
              ? 'border-primary'
              : 'border-silver dark:border-grey hover:border-primary dark:hover:border-primary'
          } ${itemStyle}`}
          onClick={() => onClick(percentage)}
        >
          +{percentage}%
        </button>
      ))}
    </>
  );
};
