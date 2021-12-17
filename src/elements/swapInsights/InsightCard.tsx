import {
  LinePercentage,
  LinePercentageData,
} from 'components/linePercentage/LinePercentage';
import { Tooltip } from 'components/tooltip/Tooltip';

interface InsightCardProps {
  label: string;
  percentages: LinePercentageData[];
  tooltip: string;
}

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
        <LinePercentage showEmpty={!data} percentages={data?.percentages} />
      </div>
    </div>
  );
};
