import { Widget } from 'components/widgets/Widget';

export const AddLiquidityError = () => {
  return (
    <Widget title="Add Liquidity">
      <div className="bg-error rounded p-20 text-white text-center">
        <div className="font-semibold mb-10">
          Invalid Pool or Pool not found!
        </div>
        <div>Please try again or contact support.</div>
      </div>
    </Widget>
  );
};
