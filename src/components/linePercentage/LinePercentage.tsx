import { classNameGenerator } from 'utils/pureFunctions';

export interface LinePercentageData {
  color: string;
  decPercent: number;
  label?: string;
}

interface LinePercentageProps {
  percentages?: LinePercentageData[];
  showEmpty?: boolean;
}

const linePercentages = (percentages: LinePercentageData[]) => {
  let count = 0;
  return percentages.map((_, index) => {
    const i = percentages[percentages.length - 1 - index];
    const linePercentage = 100 - count;
    count += i.decPercent * 100;
    return {
      linePercentage,
      percentage: i,
      color: i.color,
    };
  });
};

export const LinePercentage = ({
  percentages,
  showEmpty,
}: LinePercentageProps) => {
  return (
    <>
      <div className="mb-10 flex justify-between h-20">
        {percentages &&
          percentages.map((p) => (
            <div key={p.color}>
              <span className={`text-${p.color} text-16 font-medium`}>
                {(p.decPercent * 100).toFixed(0) + '%'}
                {p.label && p.label}
              </span>
            </div>
          ))}
      </div>
      <div className="mb-20">
        <div
          className={`relative rounded-full${classNameGenerator({
            ' opacity-30': showEmpty,
          })}`}
        >
          {percentages &&
            linePercentages(percentages).map((p, index) => (
              <div
                key={index}
                style={{
                  width: p.linePercentage.toFixed(1) + '%',
                }}
                className={`h-[4px] absolute rounded-full bg-${p.color} `}
              />
            ))}
          {showEmpty && (
            <div
              style={{ width: '100%' }}
              className="h-[4px] absolute rounded-full bg-grey-3"
            ></div>
          )}
        </div>
      </div>
    </>
  );
};
