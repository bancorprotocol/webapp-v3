import { Tooltip } from 'components/tooltip/Tooltip';
import { classNameGenerator } from 'utils/pureFunctions';

interface InsightCardProps {
  label: string;
  percentages: { color: string; decPercent: number }[];
  tooltip: string;
}

const linePercentages = (
  percentages: {
    color: string;
    decPercent: number;
  }[]
) => {
  let count = 0;
  return percentages.map((x, index) => {
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

export const InsightCard = ({ data }: { data: InsightCardProps | null }) => {
  return (
    <div className="col-span-1 flex flex-col justify-between rounded-15 p-8 border-2 border-blue-0 dark:border-blue-1">
      <span className={`text-12 font-medium ${!data ? 'opacity-30' : ''}`}>
        {data ? data.label : 'No available insights'}
        <div className="inline text-grey-4 ml-5 align-middle h-[10px]">
          <Tooltip content={data ? data.tooltip : ''} />
        </div>
      </span>
      <div>
        <div className="mb-10 flex justify-between h-20">
          {data &&
            data.percentages.map((p) => (
              <div key={p.color}>
                <span className={`text-${p.color} text-16 font-medium`}>
                  {(p.decPercent * 100).toFixed(0) + '%'}
                </span>
              </div>
            ))}
        </div>
        <div className="mb-20">
          <div
            className={`relative rounded-full${classNameGenerator({
              ' opacity-30': !data,
              ' bg-grey-3': !data,
            })}`}
          >
            {data &&
              linePercentages(data.percentages).map((p, index) => (
                <div
                  key={index}
                  style={{
                    width: p.linePercentage.toFixed(1) + '%',
                  }}
                  className={`h-[4px] absolute rounded-full bg-${p.color} `}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
