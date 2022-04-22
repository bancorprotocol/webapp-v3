import { memo, SVGProps } from 'react';

interface Props extends SVGProps<SVGSVGElement> {
  percentage: number | string;
  className?: string;
  strokeColor?: string;
  strokeWidth?: number;
}

export const CirclePercentage = memo(
  ({
    percentage,
    strokeColor = 'text-primary',
    strokeWidth = 4,
    className = '',
    ...props
  }: Props) => {
    const number = Number(percentage).toFixed(0);
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 36 36"
        {...props}
        className={`${strokeColor} ${className}`}
      >
        <path
          fill="none"
          className="stroke-current text-silver"
          strokeWidth={strokeWidth}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          fill="none"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={`${number}, 100`}
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
    );
  }
);
