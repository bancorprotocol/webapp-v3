import { ReactComponent as IconSync } from 'assets/icons/sync.svg';

interface Props {
  handleSelectSwitch: () => void;
}

export const TradeWidgetSwitchBtn = ({ handleSelectSwitch }: Props) => {
  return (
    <button
      onClick={handleSelectSwitch}
      className="transform hover:rotate-180 transition duration-500 rounded-full border-2 border-fog bg-white w-40 h-40 flex items-center justify-center absolute top-[-20px] left-[32px]"
    >
      <IconSync className="w-[25px] text-primary dark:text-primary-light" />
    </button>
  );
};
