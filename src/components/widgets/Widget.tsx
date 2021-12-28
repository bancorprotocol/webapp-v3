import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { useNavigation } from 'services/router';

interface Props {
  title: string;
  subtitle?: string;
  goBack?: Function;
  children: JSX.Element | JSX.Element[];
}
export const Widget = ({ title, subtitle, children }: Props) => {
  const { pushPools } = useNavigation();

  const goBack = () => {
    goBack ? goBack() : pushPools();
  };

  return (
    <section className="widget mx-auto">
      <div className="flex justify-between py-16 px-20">
        <SwapSwitch />
        <div className="text-center">
          <h1 className="text-20 font-semibold">{title}</h1>
          {subtitle && <h2 className="font-normal">{subtitle}</h2>}
        </div>
        <div className="flex justify-end w-[60px]">
          <button onClick={() => goBack()}>
            <IconTimes className="w-15" />
          </button>
        </div>
      </div>
      <hr className="widget-separator" />
      {children}
    </section>
  );
};
