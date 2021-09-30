import { Widget } from 'components/widgets/Widget';

export const AddLiquidityLoading = () => {
  return (
    <Widget title="Add Liquidity">
      <div className="space-y-10">
        <div className="loading-skeleton !rounded h-[50px]"></div>
        <div className="loading-skeleton !rounded h-[300px]"></div>
        <div className="loading-skeleton !rounded h-[50px]"></div>
      </div>
    </Widget>
  );
};
