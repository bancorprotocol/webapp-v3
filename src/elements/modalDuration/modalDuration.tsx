import { Dropdown } from 'components/dropdown/Dropdown';
import { Modal } from 'components/modal/Modal';
import { Duration } from 'dayjs/plugin/duration';
import { useState } from 'react';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { ReactComponent as IconClock } from 'assets/icons/clock.svg';

interface ModalDurationProps {
  duration: Duration;
  setDuration: Function;
}

export const ModalDuration = ({
  duration,
  setDuration,
}: ModalDurationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [days, setDays] = useState(duration.days());
  const [hours, setHours] = useState(duration.hours());
  const [minutes, setMinutes] = useState(duration.minutes());

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center bg-white dark:bg-blue-4 rounded-10 px-40 py-8"
      >
        {`${duration.asDays()} Days`}
        <IconChevronDown className="w-10 ml-10" />
      </button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="flex flex-col w-full p-20">
          <IconClock className="w-[52px] h-[52px] text-primary dark:text-primary-dark mb-14" />
          <div className="font-semibold text-20 mb-10">Custom Time</div>
          <div className="text-12 text-grey-4 mb-10">
            Set up your custom time peroid
          </div>

          <div className="p-10 w-[80px]">
            <Dropdown
              selected={days}
              setSelected={setDays}
              title={days?.toString()}
              items={Array.from({ length: 30 }, (item, index: number) => ({
                id: index.toString(),
                title: index.toString(),
              }))}
            />
          </div>
          <div className="p-10 w-[80px]">
            <Dropdown
              selected={hours}
              setSelected={setHours}
              title={hours?.toString()}
              items={Array.from({ length: 24 }, (item, index: number) => ({
                id: index.toString(),
                title: index.toString(),
              }))}
            />
          </div>
          <div className="p-10">
            <Dropdown
              selected={minutes}
              setSelected={setMinutes}
              title={minutes?.toString()}
              items={Array.from({ length: 60 }, (item, index: number) => ({
                id: index.toString(),
                title: index.toString(),
              }))}
            />
          </div>

          <button
            onClick={() => {}}
            className="btn-primary rounded-full w-full"
          >
            Confirm
          </button>
        </div>
      </Modal>
    </>
  );
};
