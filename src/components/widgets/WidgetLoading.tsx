import { Widget } from 'components/widgets/Widget';
import { useNavigation } from 'services/router';

export const WidgetLoading = ({ title = 'loading' }) => {
  const { pushPools } = useNavigation();
  return (
    <Widget title={title} goBack={pushPools}>
      <div className="space-y-10">
        <div className="loading-skeleton !rounded h-[50px]"></div>
        <div className="loading-skeleton !rounded h-[300px]"></div>
        <div className="loading-skeleton !rounded h-[50px]"></div>
      </div>
    </Widget>
  );
};
