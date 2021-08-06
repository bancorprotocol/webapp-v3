import 'react-tippy/dist/tippy.css';
import { Tooltip as Tippy } from 'react-tippy';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';

interface TooltipProps {
  button?: string | JSX.Element | JSX.Element[];
  content: string | JSX.Element | JSX.Element[];
  preventOverflow?: boolean;
}

export const Tooltip = ({
  button = <IconInfo className="w-[10px] h-[11px]" />,
  content,
  preventOverflow = true,
}: TooltipProps) => {
  const popperOptions = {
    modifiers: {
      preventOverflow: {
        enabled: preventOverflow,
      },
      flip: {
        enabled: preventOverflow,
      },
    },
  };

  return (
    <Tippy
      position="top"
      arrow
      trigger="mouseenter"
      popperOptions={popperOptions}
      html={<div>{content}</div>}
    >
      <button>{button}</button>
    </Tippy>
  );
};
