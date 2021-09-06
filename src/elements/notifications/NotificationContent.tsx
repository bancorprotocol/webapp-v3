import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { ReactComponent as IconLink } from 'assets/icons/link.svg';
import {
  Notification,
  NotificationType,
} from 'redux/notification/notification';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { classNameGenerator } from 'utils/pureFunctions';
import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import { useWeb3React } from '@web3-react/core';
import { getNetworkVariables } from 'services/web3/config';
import { EthNetworks } from 'services/web3/types';

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
  const [isHovering, setIsHovering] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAlert) return;
    if (type === NotificationType.pending) return;
    if (isHovering) {
      timer.current && clearTimeout(timer.current);
      return;
    }
    timer.current = setTimeout(() => {
      onRemove(id);
    }, showSeconds! * 1000);

    return () => {
      timer.current && clearTimeout(timer.current)
    }
  }, [isAlert, onRemove, type, showSeconds, id, isHovering]);



  const StatusIcon = () => {
    switch (type) {
      case NotificationType.pending:
        return (
          <div className="relative flex justify-center items-center">
            <IconBancor className="absolute w-5 text-primary" />
            <div className="absolute w-14 h-14 border border-grey-1 rounded-full" />
            <div className="w-14 h-14 border-t border-r border-primary rounded-full animate-spin" />
          </div>
        );
      case NotificationType.success:
        return <IconCheck className="w-8 text-white" />;
      case NotificationType.error:
        return <IconTimes className="w-6 text-white" />;
      default:
        return <span className="text-white">i</span>;
    }
  };

  const { chainId } = useWeb3React();
  const etherscanUrl = () => {
    const currentNetwork =
      chainId === EthNetworks.Ropsten
        ? EthNetworks.Ropsten
        : EthNetworks.Mainnet;
    const baseUrl = getNetworkVariables(currentNetwork).etherscanUrl;
    return `${baseUrl}/tx/${txHash}`;
  };

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="text-12"
    >
      <div className="flex justify-between items-center mb-4">
        <div className="flex">
          <div
            className={`flex items-center justify-center ${classNameGenerator({
              'w-14 h-14 rounded-full': type !== NotificationType.pending,
              'bg-success': type === NotificationType.success,
              'bg-error': type === NotificationType.error,
              'bg-info': type === NotificationType.info,
            })}`}
          >
            {StatusIcon()}
          </div>

          <h4 className="text-12 font-medium mx-8">{title}</h4>
          <span className="text-grey-4 dark:text-grey-3">
            {dayjs.unix(timestamp).fromNow(true)}
          </span>
        </div>
        <button className="expand-clickable-area" onClick={() => onRemove(id)}>
          <IconTimes className="w-8" />
        </button>
      </div>
      {txHash && isHovering ? (
        <a
          href={etherscanUrl()}
          target="_blank"
          className="ml-[22px] flex text-primary font-semibold"
          rel="noreferrer"
        >
          View on Etherscan <IconLink className="w-14 ml-6" />
        </a>
      ) : (
        <p className="ml-[22px] text-grey-4 dark:text-grey-3">{msg}</p>
      )}
    </div>
  );
};
