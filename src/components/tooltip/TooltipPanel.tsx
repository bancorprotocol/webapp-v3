import {
  useState,
  useRef,
  MutableRefObject,
  useEffect,
  useCallback,
} from 'react';
import { usePopper } from 'react-popper';
import type * as PopperJS from '@popperjs/core';
import 'components/tooltip/TooltipPanel.css';

type Props = {
  targetRef: MutableRefObject<null | HTMLButtonElement>;
  placement?: PopperJS.Placement;
  children: JSX.Element | JSX.Element[];
};

export const TooltipPanel = ({
  targetRef,
  placement = 'top',
  children,
}: Props) => {
  const popperRef = useRef(null);
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);
  const [isVisible, setVisible] = useState(false);

  const { styles, attributes } = usePopper(
    targetRef.current,
    popperRef.current,
    {
      placement,
      modifiers: [
        {
          name: 'arrow',
          options: {
            element: arrowRef,
          },
        },
        {
          name: 'offset',
          options: {
            offset: [0, 10],
          },
        },
      ],
    }
  );

  const handleClickOutside = useCallback(
    (e: any) => {
      return targetRef.current!.contains(e.target)
        ? undefined
        : setVisible(false);
    },
    [targetRef]
  );

  useEffect(() => {
    if (targetRef.current) {
      targetRef.current.onclick = () => setVisible(!isVisible);
      targetRef.current.onmouseenter = () => setVisible(true);
      targetRef.current.onmouseleave = () => setVisible(false);
    }
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [targetRef, handleClickOutside, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="tooltip-panel"
      ref={popperRef}
      style={styles.popper}
      {...attributes.popper}
    >
      <div
        className="tooltip-arrow"
        ref={setArrowRef}
        style={{
          ...styles.arrow,
          transform: `${styles.arrow.transform} rotate(45deg)`,
        }}
      />
      {children}
    </div>
  );
};
