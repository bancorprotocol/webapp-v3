import { Button, ButtonVariant } from 'components/button/Button';
import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';
import { ReactComponent as IconBell } from 'assets/icons/bell.svg';
import { ReactComponent as IconCalendar } from 'assets/icons/calendar.svg';
import { memo } from 'react';
import {
  CalendarOptions,
  GoogleCalendar,
  ICalendar,
  OutlookCalendar,
} from 'datebook';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { openNewTab } from 'utils/pureFunctions';
import dayjs from 'dayjs';

const generateCalendarEvent = (
  type: 'ical' | 'google' | 'outlook',
  days: number
) => {
  const start = dayjs().add(days, 'day').toDate();
  const end = dayjs(start).add(15, 'minute').toDate();

  const event: CalendarOptions = {
    title: 'Bancor Withdrawal',
    description: 'Bancor Withdrawal cooldown ended.',
    start,
    end,
  };

  switch (type) {
    case 'google':
      return openNewTab(new GoogleCalendar(event).render());
    case 'outlook':
      return openNewTab(new OutlookCalendar(event).render());
    default:
      return new ICalendar(event).download();
  }
};

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
              <button
                onClick={() =>
                  generateCalendarEvent('google', lockDurationInDays)
                }
              >
                Google Web
              </button>
              <button
                onClick={() =>
                  generateCalendarEvent('outlook', lockDurationInDays)
                }
              >
                Outlook Web
              </button>
              <button
                onClick={() =>
                  generateCalendarEvent('ical', lockDurationInDays)
                }
              >
                iCalendar / ICS
              </button>
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
