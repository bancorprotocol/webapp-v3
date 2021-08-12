import { ReactComponent as IconInfo } from 'assets/icons/info.svg';
import { classNameGenerator } from 'utils/pureFunctions';

interface InsightCardProps {
  label: string;
  percentages: { color: string; decPercent: number }[];
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
        {false && <IconInfo className="inline text-grey-4 w-[10px] ml-5" />}
      </span>
      <div className="h-[31px]">
        <div className="flex justify-between mb-2 h-20">
          {data &&
            data.percentages.map((p) => (
              <div key={p.color}>
                <span className={`text-${p.color} text-16 font-medium`}>
                  {(p.decPercent * 100).toFixed(0) + '%'}
                </span>
              </div>
            ))}
        </div>
        <div>
          <div
            className={`h-5 relative rounded-full${classNameGenerator({
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
                  className={`h-5 absolute rounded-full bg-${p.color} `}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
