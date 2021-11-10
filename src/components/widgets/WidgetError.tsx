import { Widget } from 'components/widgets/Widget';

export const WidgetError = ({ title = 'ERROR' }) => {
  return (
    <Widget title={title}>
      <div className="bg-error rounded p-20 text-white text-center">
        <div className="font-semibold mb-10">
          Invalid Pool or Pool not found!
        </div>
        <div>Please try again or contact support.</div>
      </div>
    </Widget>
  );
};
