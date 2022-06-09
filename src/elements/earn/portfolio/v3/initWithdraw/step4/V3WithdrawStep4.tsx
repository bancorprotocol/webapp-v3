import { Button, ButtonVariant } from 'components/button/Button';
import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';
import { ReactComponent as IconBell } from 'assets/icons/bell.svg';
import { ReactComponent as IconCalendar } from 'assets/icons/calendar.svg';
import { memo } from 'react';
import { CalendarOptions } from 'datebook';
import { PopoverV3 } from 'components/popover/PopoverV3';

const getCalendarOptions = (): CalendarOptions => {
  return {
    title: 'Bancor Withdrawal',
    description: 'Bancor Withdrawal cooldown ended.',
    start: new Date('2020-07-04T19:00:00'),
    end: new Date('2020-07-04T23:30:00'),
  };
};

const generateICalendarEvent = () => {};

interface Props {
  onClose: (state: boolean) => void;
  lockDurationInDays: number;
  requestId: string;
}

const V3WithdrawStep4 = ({ onClose, lockDurationInDays, requestId }: Props) => {
  return (
    <div className="text-center">
      <span className="flex justify-center text-primary items-center text-20">
        <IconCheck className="w-30 mr-10" /> Cooldown began
      </span>
      <h1 className="text-[36px] font-normal my-50 leading-10">
        Remember to come back after {lockDurationInDays} days
      </h1>

      <div className="flex flex-col items-center space-y-40">
        <Button
          variant={ButtonVariant.Secondary}
          className="px-50"
          onClick={() => onClose(false)}
        >
          Return to portfolio
        </Button>

        <div className="space-y-20">
          <PopoverV3
            buttonElement={() => (
              <button className="flex items-center">
                <IconCalendar className="w-20 mr-20" />
                Add to calendar
              </button>
            )}
          >
            <div className="flex flex-col text-left items-start space-y-10">
              <button>Google Web</button>
              <button>Outlook Web</button>
              <button>iCalendar / ICS</button>
            </div>
          </PopoverV3>

          <a
            className="flex items-center"
            href={`https://app.hal.xyz/recipes/bancor-v3-track-ready-withdrawals?withdrawalId=${requestId}`}
            target="_blank"
            rel="noreferrer"
          >
            <IconBell className="w-20 mr-20" />
            Set a hal.xyz reminder
          </a>
        </div>
      </div>
    </div>
  );
};

export default memo(V3WithdrawStep4);
