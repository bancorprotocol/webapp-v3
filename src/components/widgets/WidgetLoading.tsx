import { Widget } from 'components/widgets/Widget';
import { usePages } from 'pages/Router';

export const WidgetLoading = ({ title = 'loading' }) => {
  const { goToPage } = usePages();
  return (
    <Widget title={title} goBack={goToPage.earn}>
      <div className="space-y-10">
        <div className="loading-skeleton !rounded h-[50px]"></div>
        <div className="loading-skeleton !rounded h-[300px]"></div>
        <div className="loading-skeleton !rounded h-[50px]"></div>
      </div>
    </Widget>
  );
};
