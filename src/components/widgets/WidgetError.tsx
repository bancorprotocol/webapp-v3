import { Widget } from 'components/widgets/Widget';
import { usePages } from 'pages/Router';

export const WidgetError = ({ title = 'ERROR' }) => {
  const { goToPage } = usePages();
  return (
    <Widget title={title} goBack={goToPage.earn}>
      <div className="bg-error rounded p-20 text-white text-center">
        <div className="font-semibold mb-10">
          Invalid Pool or Pool not found!
        </div>
        <div>Please try again or contact support.</div>
      </div>
    </Widget>
  );
};
