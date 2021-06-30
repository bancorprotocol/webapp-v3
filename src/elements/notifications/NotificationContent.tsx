import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { Notification, setStatus } from 'redux/notification/notification';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { classNameGenerator } from 'utils/pureFunctions';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import { web3 } from 'services/web3/contracts';
import { useInterval } from 'hooks/useInterval';
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'now',
    m: 'now',
    mm: '%d min ago',
    h: 'an hour ago',
    hh: '%d hours ago',
    d: 'a day ago',
    dd: '%d days ago',
    M: 'a month ago',
    MM: '%d months ago',
    y: 'a year ago',
    yy: '%d years ago',
  },
});

export interface NotificationContentProps {
  data: Notification;
  onRemove: Function;
  isAlert?: boolean;
}

export const NotificationContent = ({
  data,
  onRemove,
  isAlert,
}: NotificationContentProps) => {
  const { id, type, title, msg, showSeconds, timestamp, txHash } = data;

  const [delay, setDelay] = useState<number | null>(2000);
  const [isHover, setIsHover] = useState(false);

  const dispatch = useDispatch();

  useInterval(() => {
    if (txHash === undefined) {
      setDelay(null);
      return;
    }

    const checkStatus = async () => {
      const tx = await web3.eth
        .getTransactionReceipt(txHash)
        .catch((e) => console.error('web3 failed: getTransactionReceipt', e));
      if (tx) {
        dispatch(setStatus({ id, type: tx.status ? 'success' : 'error' }));
      }
    };

    void checkStatus();
  }, delay);

  useEffect(() => {
    if (!isAlert) return;
    setTimeout(() => {
      onRemove(id);
    }, showSeconds! * 1000);
  }, [isAlert, onRemove, showSeconds, id]);

  const StatusIcon = () => {
    switch (type) {
      case 'pending':
        return (
          <div className="relative flex justify-center items-center">
            <IconBancor className="absolute w-5 text-primary" />
            <div className="absolute w-14 h-14 border border-grey-1 rounded-full" />
            <div className="w-14 h-14 border-t border-r border-primary rounded-full animate-spin" />
          </div>
        );
      case 'success':
        return <IconCheck className="w-8 text-white" />;
      case 'error':
        return <IconTimes className="w-6 text-white" />;
      default:
        return <span className="text-white">i</span>;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="text-12"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex">
          <div
            className={`flex items-center justify-center ${classNameGenerator({
              'w-14 h-14 rounded-full': type !== 'pending',
              'bg-success': type === 'success',
              'bg-error': type === 'error',
              'bg-info': type === 'info',
            })}`}
          >
            {StatusIcon()}
          </div>

          <h4 className="text-12 font-medium mx-8">
            {isHover ? 'View on Etherscan' : title}
          </h4>
          {!isHover ? (
            <span className="text-grey-4">
              {dayjs.unix(timestamp).fromNow(true)}
            </span>
          ) : (
            ''
          )}
        </div>
        <button onClick={() => onRemove(id)}>
          <IconTimes className="w-8" />
        </button>
      </div>
      <p className="ml-[22px] text-grey-4">{msg}</p>
    </div>
  );
};
