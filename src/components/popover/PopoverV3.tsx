import { Portal, Transition } from '@headlessui/react';
import { ReactNode, useRef, useState } from 'react';
import { Modifier, usePopper } from 'react-popper';
import * as PopperJS from '@popperjs/core';

type PopoverOptions = Omit<Partial<PopperJS.Options>, 'modifiers'> & {
  createPopper?: typeof PopperJS.createPopper;
  modifiers?: ReadonlyArray<Modifier<any>>;
};

interface Props {
  children: ReactNode;
  buttonElement: (open: boolean) => ReactNode;
  options?: PopoverOptions;
}

let timeout: NodeJS.Timeout;
let prevPopFunc: Function = () => {};

const defaultOptions: PopoverOptions = {
  placement: 'top',
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 5],
      },
    },
  ],
};

export const PopoverV3 = ({
  children,
  buttonElement,
  options = defaultOptions,
}: Props) => {
  const popperElRef = useRef(null);
  const [targetElement, setTargetElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const { styles, attributes } = usePopper(
    targetElement,
    popperElement,
    options
  );

  const [open, setOpen] = useState(false);

  const openPopover = () => {
    prevPopFunc();
    clearInterval(timeout);
    setOpen(true);
  };

  const closePopover = (delay: number) => {
    prevPopFunc = () => setOpen(false);
    timeout = setTimeout(() => setOpen(false), delay);
  };

  return (
    <>
      <div
        // @ts-ignore
        ref={setTargetElement}
        onMouseEnter={() => openPopover()}
        onMouseLeave={() => closePopover(600)}
      >
        {buttonElement(open)}
      </div>
      <Portal>
        <div
          ref={popperElRef}
          style={styles.popper}
          {...attributes.popper}
          className="z-50"
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
              onMouseEnter={() => openPopover()}
              onMouseLeave={() => closePopover(200)}
            >
              {children}
            </div>
          </Transition>
        </div>
      </Portal>
    </>
  );
};
