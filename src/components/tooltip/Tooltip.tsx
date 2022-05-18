import { cloneElement, MouseEventHandler, useRef } from 'react';
import { TooltipPanel } from './TooltipPanel';
import { ReactComponent as IconInfo } from 'assets/icons/info-solid.svg';
import type * as PopperJS from '@popperjs/core';

interface TooltipProps {
  button?: string | JSX.Element | JSX.Element[];
  onClick?: MouseEventHandler<HTMLButtonElement>;
  placement?: PopperJS.Placement;
  content: string | JSX.Element | JSX.Element[];
  children?: JSX.Element;
}

export const Tooltip = ({
  content,
  button = (
    <IconInfo className="w-[10px] h-[10px] text-black-low dark:text-white-low" />
  ),
  onClick,
  placement,
  children,
}: TooltipProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  return (
    <>
      {children ? (
        cloneElement(children, { ref: buttonRef })
      ) : (
        <button ref={buttonRef} onClick={onClick}>
          {button}
        </button>
      )}

      <TooltipPanel placement={placement} targetRef={buttonRef}>
        {typeof content === 'string' ? (
          <div className="text-12">{content}</div>
        ) : (
          content
        )}
      </TooltipPanel>
    </>
  );
};
