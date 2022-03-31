import { memo } from 'react';

interface Props {
  percentage: number;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar = memo(
  ({ percentage, showPercentage = false, className = 'text-black' }: Props) => {
    return (
      <div className="flex items-center space-x-10 h-20">
        <div className="relative w-full">
          <div className="absolute bg-silver rounded-full h-4 w-full" />
          <div
            className={`absolute rounded-full h-4 ${className}`}
            style={{ width: `${percentage}%`, backgroundColor: 'currentcolor' }}
          />
        </div>
        {showPercentage && (
          <span className="text-12 pt-4 text-secondary">
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>
    );
  }
);
