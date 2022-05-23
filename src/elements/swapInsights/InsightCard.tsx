import {
  LinePercentage,
  LinePercentageData,
} from 'components/linePercentage/LinePercentage';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { ReactComponent as IconInfo } from 'assets/icons/info-solid.svg';

interface InsightCardProps {
  label: string;
  percentages: LinePercentageData[];
  tooltip: string;
}

export const InsightCard = ({ data }: { data: InsightCardProps | null }) => {
  return (
    <div className="col-span-1 flex flex-col justify-between rounded-15 p-8 border-2 border-fog dark:border-black-low">
      <span className={`text-12 font-medium ${!data ? 'opacity-30' : ''}`}>
        {data ? data.label : 'No available insights'}
        <div className="inline-flex text-grey ml-5 align-middle h-[10px]">
          <PopoverV3
            buttonElement={() => (
              <IconInfo className="w-[10px] h-[10px] text-black-low dark:text-white-low" />
            )}
            children={data ? data.tooltip : ''}
          />
        </div>
      </span>
      <div>
        <LinePercentage showEmpty={!data} percentages={data?.percentages} />
      </div>
    </div>
  );
};
