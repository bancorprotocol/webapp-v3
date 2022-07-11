import { memo } from 'react';
import {
  CalendarOptions,
  GoogleCalendar,
  ICalendar,
  OutlookCalendar,
} from 'datebook';
import { openNewTab } from 'utils/pureFunctions';
import dayjs from 'dayjs';
import { V3WithdrawConfirmContent } from '../../pendingWithdraw/confirm/V3WithdrawConfirmModal';
import { useAppSelector } from 'store';
import { getPortfolioWithdrawalRequests } from 'store/portfolio/v3Portfolio';

export const generateCalendarEvent = (
  type: 'ical' | 'google' | 'outlook',
  days: number
) => {
  const start = dayjs().add(days, 'day').toDate();
  const end = dayjs(start).add(15, 'minute').toDate();

  const event: CalendarOptions = {
    title: 'Bancor Withdrawal',
    description: 'Bancor withdrawal cooldown ended.',
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
  isOpen: boolean;
  requestId: string;
}

const V3WithdrawStep4 = ({ onClose, isOpen }: Props) => {
  const withdrawalRequests = useAppSelector(getPortfolioWithdrawalRequests);
  const withdrawRequest =
    withdrawalRequests.length === 0
      ? undefined
      : withdrawalRequests[withdrawalRequests.length - 1];
  if (!withdrawRequest) return null;

  return (
    <V3WithdrawConfirmContent
      isModalOpen={isOpen}
      setIsModalOpen={onClose}
      withdrawRequest={withdrawRequest}
      openCancelModal={() => {}}
    />
  );
  /*return (
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
                className="hidden md:block"
                onClick={() =>
                  generateCalendarEvent('ical', lockDurationInDays)
                }
              >
                iCalendar / ICS
              </button>
            </div>
          </PopoverV3>

          <Navigate
            className="flex items-center"
            to={`https://app.hal.xyz/recipes/bancor-v3-track-ready-withdrawals?withdrawalId=${requestId}`}
          >
            <IconBell className="w-20 mr-20" />
            Set a hal.xyz reminder
          </Navigate>
        </div>
      </div>
    </div>
  );*/
};

export default memo(V3WithdrawStep4);
