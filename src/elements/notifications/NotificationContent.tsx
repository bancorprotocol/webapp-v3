import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { Notification } from 'redux/notification/notification';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { classNameGenerator } from 'utils/pureFunctions';

interface NotificationContentProps {
  data: Notification;
  onRemove: Function;
}

export const NotificationContent = ({
  data,
  onRemove,
}: NotificationContentProps) => {
  const { id, type, title, msg, showSeconds, timestamp, txHash } = data;

  const StatusIcon = () => {
    switch (type) {
      case 'pending':
        return (
          <>
            <IconBancor className="absolute w-5 text-primary" />
            <div className="absolute w-14 h-14 border border-grey-1 rounded-full" />
            <div className="w-14 h-14 border-t border-r border-primary rounded-full animate-spin" />
          </>
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
    <div className="text-12">
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

          <h4 className="text-12 font-medium mx-8">{title}</h4>
          <span className="text-grey-4">3 min ago</span>
        </div>
        <button onClick={() => onRemove(id)}>
          <IconTimes className="w-8" />
        </button>
      </div>
      <p className="ml-[22px] text-grey-4">{msg}</p>
    </div>
  );
};
