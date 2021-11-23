import { useState } from 'react';
import dayjs from 'utils/dayjs';
import { Dropdown } from 'components/dropdown/Dropdown';
import { Modal } from 'components/modal/Modal';
import { Duration } from 'dayjs/plugin/duration';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { ReactComponent as IconClock } from 'assets/icons/clock-solid.svg';
import { formatDuration } from 'utils/helperFunctions';

interface ModalDurationProps {
  duration: Duration;
  setDuration: Function;
}

interface DurationItem {
  id: string;
  title: number;
}

export const ModalDuration = ({
  duration,
  setDuration,
}: ModalDurationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [days, setDays] = useState(duration.days());
  const [hours, setHours] = useState(duration.hours());
  const [minutes, setMinutes] = useState(duration.minutes());

  const daysItems: DurationItem[] = Array.from(
    { length: 31 },
    (_, index: number) => ({
      id: index.toString(),
      title: index,
    })
  );

  const hoursItems: DurationItem[] = Array.from(
    { length: 24 },
    (_, index: number) => ({
      id: index.toString(),
      title: index,
    })
  );

  const minutesItems: DurationItem[] = Array.from(
    { length: 60 },
    (_, index: number) => ({
      id: index.toString(),
      title: index,
    })
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center bg-white dark:bg-blue-4 rounded-10 px-40 py-8"
      >
        {formatDuration(duration)}
        <IconChevronDown className="w-10 ml-10" />
      </button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="flex flex-col items-center w-full px-20 pb-20">
          <IconClock className="w-[52px] h-[52px] text-primary dark:text-primary-dark mb-14" />
          <div className="font-semibold text-20 mb-10">Custom Time</div>
          <div className="text-12 text-grey-4 mb-10">
            Set up your custom time peroid
          </div>
          <div className="w-[160px] text-14 font-medium">
            <div className="flex justify-between items-center">
              Days
              <div className="p-10 w-[100px]">
                <Dropdown
                  selected={days}
                  setSelected={(x: DurationItem) => setDays(x.title)}
                  title={days?.toString()}
                  items={daysItems}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              Hours
              <div className="p-10 w-[100px]">
                <Dropdown
                  selected={hours}
                  setSelected={(x: DurationItem) => setHours(x.title)}
                  title={hours?.toString()}
                  items={hoursItems}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              Minutes
              <div className="p-10 w-[100px]">
                <Dropdown
                  selected={minutes}
                  setSelected={(x: DurationItem) => setMinutes(x.title)}
                  title={minutes?.toString()}
                  items={minutesItems}
                  openUp
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setDuration(dayjs.duration({ days, hours, minutes }));
              setIsOpen(false);
            }}
            className="btn-primary rounded-full w-full mt-15"
          >
            Confirm
          </button>
        </div>
      </Modal>
    </>
  );
};
