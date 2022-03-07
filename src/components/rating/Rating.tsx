const getAttr = (percentage: number, starSize: number, starCount: number) => ({
  viewBox: `0 0 ${starSize * starCount} ${starSize}`,
  style: {
    clipPath: `polygon(0 0, ${percentage}% 0, ${percentage}% 100%, 0 100%)`,
  },
});

interface Props {
  percentage: number;
  starCount?: number;
  className?: string;
  classStar?: string;
  classEmpty?: string;
  showEmpty?: boolean;
  fillEmpty?: boolean;
  strokeWidth?: number;
}

export const Rating = ({
  percentage,
  starCount = 5,
  className = '',
  classStar = 'text-warning',
  classEmpty = 'text-grey',
  showEmpty = true,
  fillEmpty = false,
  strokeWidth = 0.5,
}: Props) => {
  const starSize = 20;
  const stars = [...Array(starCount)].map((_, i) => i * starSize);

  return (
    <div className={`relative ${className}`}>
      {showEmpty && (
        <svg
          {...getAttr(100, starSize, starCount)}
          className={`absolute text-grey stroke-current ${classEmpty} ${
            fillEmpty ? 'fill-current' : ''
          }`}
          fill={'none'}
          strokeWidth={strokeWidth}
        >
          {[...Array(starCount)].map((size, i) => (
            <use key={size} x={i * starSize} y="0" xlinkHref="#star-svg" />
          ))}
        </svg>
      )}

      <svg
        {...getAttr(percentage, starSize, starCount)}
        className={`fill-current stroke-current ${classStar}`}
        strokeWidth={strokeWidth}
      >
        {stars.map((size) => (
          <use key={size} x={size} y="0" xlinkHref="#star-svg" />
        ))}
      </svg>
      <StarSVG />
    </div>
  );
};

const StarSVG = () => (
  <svg className="display-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <symbol id="star-svg">
        <path
          d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462
              c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292
              c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034
              c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72
              c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
        />
      </symbol>
    </defs>
  </svg>
);
