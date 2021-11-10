import { Widget } from 'components/widgets/Widget';

export const WidgetLoading = ({ title = 'loading' }) => {
  return (
    <Widget title={title}>
      <div className="space-y-10">
        <div className="loading-skeleton !rounded h-[50px]"></div>
        <div className="loading-skeleton !rounded h-[300px]"></div>
        <div className="loading-skeleton !rounded h-[50px]"></div>
      </div>
    </Widget>
  );
};
