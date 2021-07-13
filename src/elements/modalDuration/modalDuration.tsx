import { Dropdown } from 'components/dropdown/Dropdown';
import { Modal } from 'components/modal/Modal';
import { Duration } from 'dayjs/plugin/duration';
import { useState } from 'react';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';

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
      <Modal isOpen={isOpen} setIsOpen={setIsOpen} title="Select Duration">
        <>
          <div className="p-10">
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
          <div className="p-10">
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
        </>
      </Modal>
    </>
  );
};
