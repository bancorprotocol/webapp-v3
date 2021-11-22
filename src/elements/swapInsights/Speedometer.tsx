import { Summary } from 'services/api/intoTheBlock';
import { pick, toPairs } from 'lodash';

export const Speedometer = ({ summary }: { summary: Summary | null }) => {
  const rotation = summary ? summary.score * 180 : 90;

  const gradientColour =
    rotation > 110 ? '#0ED3B0' : rotation > 70 ? 'grey' : 'red';

  const title = () => {
    if (!summary) return 'neutral';
    if (summary.score < summary.bullish && summary.score > summary.bearish)
      return 'neutral';
    const findTitle = toPairs(
      pick(summary, ['bullish', 'bearish', 'neutral'])
    ).sort(([, a], [, b]) => Number(b) - Number(a))[0];
    return findTitle[0];
  };

  const titleColour =
    rotation > 110
      ? 'text-success'
      : rotation > 70
      ? 'text-grey-3'
      : 'text-error';

  return (
    <div className={`${!summary ? 'opacity-30' : ''}`}>
      <div>
        <svg viewBox="0 0 68 41">
          <circle
            cx="34"
            cy="34"
            r="31.8"
            fill="none"
            className="text-error"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="39.5 200"
            strokeDashoffset="-98"
            strokeLinecap="round"
          />
          <circle
            cx="34"
            cy="34"
            r="31.8"
            fill="none"
            className="text-grey-3"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="20 200"
            strokeDashoffset="-140"
            strokeLinecap="round"
          />
          <circle
            cx="34"
            cy="34"
            r="31.8"
            fill="none"
            className="text-success"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="39 200"
            strokeDashoffset="-98"
            strokeLinecap="round"
            transform="scale(-1 1)"
            transform-origin="34 34"
          />
          <circle cx="34" cy="34" r="30" fill={`url(#meter-bg${rotation})`} />
          <line
            x1="6"
            y1="34"
            x2="34"
            y2="34"
            className="text-black dark:text-white"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeLinecap="round"
            transform={`rotate(${rotation})`}
            transform-origin="34 34"
          />
          <circle
            cx="34"
            cy="34"
            r="1.5"
            fill="white"
            stroke="black"
            strokeWidth="0.5"
          />

          <defs>
            <linearGradient
              id={`meter-bg${rotation}`}
              gradientTransform="rotate(90)"
            >
              <stop offset="0%" stopColor={gradientColour} stopOpacity="40%" />
              <stop
                offset="55%"
                className="text-white dark:text-blue-4"
                stopColor="currentColor"
                stopOpacity="0%"
              />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div
        className={`${titleColour} text-center font-semibold text-16 uppercase`}
      >
        {title()}
      </div>
      <div className="grid grid-cols-3 text-center mt-10">
        <div>
          <div className="text-20 font-semibold text-error">
            {summary ? summary.bearish : 0}
          </div>
          <div>Bearish</div>
        </div>
        <div>
          <div className="text-20 font-semibold text-grey-3">
            {summary ? summary.neutral : 0}
          </div>
          <div>Neutral</div>
        </div>
        <div>
          <div className="text-20 font-semibold text-success">
            {summary ? summary.bullish : 0}
          </div>
          <div>Bullish</div>
        </div>
      </div>
    </div>
  );
};
