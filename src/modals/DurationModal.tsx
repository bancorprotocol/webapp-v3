import { useState } from 'react';
import dayjs from 'utils/dayjs';
import { Dropdown } from 'components/dropdown/Dropdown';
import { Duration } from 'dayjs/plugin/duration';
import { ReactComponent as IconClock } from 'assets/icons/clock-solid.svg';
import { Button, ButtonSize } from 'components/button/Button';
import { Modal, ModalNames } from 'modals';
import { useAppSelector } from 'store';
import { getModalData, getIsModalOpen } from 'store/modals/modals';
import { useModal } from 'hooks/useModal';

interface DurationItem {
  id: string;
  title: number;
}

interface DurationProp {
  duration: Duration;
  setDuration: Function;
}

export const DurationModal = () => {
  const { popModal } = useModal();
  const isOpen = useAppSelector((state) =>
    getIsModalOpen(state, ModalNames.DepositETH)
  );

  const props = useAppSelector<DurationProp | undefined>((state) =>
    getModalData(state, ModalNames.Duration)
  );

  const [days, setDays] = useState(props?.duration.days());
  const [hours, setHours] = useState(props?.duration.hours());
  const [minutes, setMinutes] = useState(props?.duration.minutes());

  const onClose = () => {
    popModal();
  };

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
      <Modal isOpen={isOpen} setIsOpen={onClose} title={'Duration'}>
        <div className="flex flex-col items-center w-full px-20 pb-20">
          <IconClock className="w-[52px] h-[52px] text-primary dark:text-primary-dark mb-14" />
          <div className="font-semibold text-20 mb-10">Custom Time</div>
          <div className="text-12 text-grey mb-10">
            Set up your custom time peroid
          </div>
          <div className="w-[160px] text-14 font-medium">
            <div className="flex justify-between items-center">
              Days
              <div className="p-10 w-[100px]">
                <Dropdown
                  selected={days}
                  setSelected={(x: DurationItem) => setDays(x.title)}
                  title={days ? days.toString() : ''}
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
                  title={hours ? hours.toString() : ''}
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
                  title={minutes ? minutes.toString() : ''}
                  items={minutesItems}
                  openUp
                />
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              props?.setDuration(dayjs.duration({ days, hours, minutes }));
              onClose();
            }}
            size={ButtonSize.Full}
            className="mt-15"
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </>
  );
};
