import { Portal, Transition } from '@headlessui/react';
import { ReactNode, useRef, useState } from 'react';
import { Modifier, usePopper } from 'react-popper';
import * as PopperJS from '@popperjs/core';

type PopoverOptions = Omit<Partial<PopperJS.Options>, 'modifiers'> & {
  createPopper?: typeof PopperJS.createPopper;
  modifiers?: ReadonlyArray<Modifier<any>>;
};

interface Props {
  children: ReactNode | string;
  buttonElement: (props: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
  }) => ReactNode;
  options?: PopoverOptions;
  hover?: boolean;
  showArrow?: boolean;
}

let timeout: NodeJS.Timeout;
let prevPopFunc: Function = () => {};

const defaultOptions: PopoverOptions = {
  placement: 'top',
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 15],
      },
    },
  ],
};

export const PopoverV3 = ({
  children,
  buttonElement,
  options = defaultOptions,
  hover = true,
  showArrow = true,
}: Props) => {
  const popperElRef = useRef(null);
  const [targetElement, setTargetElement] = useState<HTMLDivElement | null>(
    null
  );
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null
  );
  const [arrowRef, setArrowRef] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(targetElement, popperElement, {
    ...options,
    modifiers: [
      ...(options.modifiers as Modifier<any>[]),
      {
        name: 'arrow',
        options: {
          element: arrowRef,
        },
      },
    ],
  });

  const [open, setOpen] = useState(false);

  const handleOnMouseEnter = () => {
    if (!hover) {
      return;
    }

    prevPopFunc();
    clearInterval(timeout);
    setOpen(true);
  };

  const handleOnMouseLeave = (delay: number) => {
    if (!hover) {
      return;
    }

    prevPopFunc = () => setOpen(false);
    timeout = setTimeout(() => setOpen(false), delay);
  };

  return (
    <div className="flex">
      <div
        ref={setTargetElement}
        onMouseEnter={() => handleOnMouseEnter()}
        onMouseLeave={() => handleOnMouseLeave(600)}
      >
        {buttonElement({
          isOpen: open,
          setIsOpen: (open: boolean) => setOpen(open),
        })}
      </div>
      <Portal>
        <div
          ref={popperElRef}
          style={styles.popper}
          {...attributes.popper}
          className="z-40 popover-panel"
        >
          <Transition
            show={open}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
            beforeEnter={() => setPopperElement(popperElRef.current)}
            afterLeave={() => setPopperElement(null)}
          >
            <div
              className="max-w-[300px] bg-white dark:bg-black border border-silver dark:border-grey py-20 px-24 rounded"
              onMouseEnter={() => handleOnMouseEnter()}
              onMouseLeave={() => handleOnMouseLeave(200)}
            >
              {children}
            </div>
            <div
              className={`popover-arrow ${showArrow ? '' : 'hidden'}`}
              ref={setArrowRef}
              style={{
                ...styles.arrow,
                transform: `${styles.arrow.transform} rotate(45deg)`,
              }}
            />
          </Transition>
        </div>
      </Portal>
    </div>
  );
};
