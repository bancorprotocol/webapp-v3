import 'react-tippy/dist/tippy.css';
import { Tooltip } from 'react-tippy';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';

export const InfoTooltip = ({ text }: { text: string }) => {
  return (
    <Tooltip title={text} position="top" arrow trigger="mouseenter">
      <button>
        <IconInfo className="w-[10px] h-[11px]" />
      </button>
    </Tooltip>
  );
};
