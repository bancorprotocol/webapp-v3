import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { useNavigation } from 'hooks/useNavigation';

interface Props {
  title: string;
  subtitle?: string;
  goBack?: Function;
  children: JSX.Element | JSX.Element[];
}
export const Widget = ({ title, subtitle, children, goBack }: Props) => {
  const { goToPage } = useNavigation();

  const handleBackClick = () => {
    goBack ? goBack() : goToPage.earn();
  };

  return (
    <section className="widget mx-auto">
      <div className="flex justify-between py-16 px-20">
        <SwapSwitch />
        <div className="flex items-center justify-center flex-col">
          <h1 className="text-20 font-semibold">{title}</h1>
          {subtitle && <h2 className="font-normal">{subtitle}</h2>}
        </div>
        <div className="flex justify-end w-[80px]">
          <button onClick={() => handleBackClick()}>
            <IconTimes className="w-15" />
          </button>
        </div>
      </div>
      <hr className="widget-separator" />
      {children}
    </section>
  );
};
