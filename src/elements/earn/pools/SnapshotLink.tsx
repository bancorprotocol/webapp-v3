import { Navigate } from 'components/navigate/Navigate';
import { ReactComponent as IconInfo } from 'assets/icons/info.svg';
import { config } from 'config';

interface Props {
  iconClassName?: string;
}

export const DEFAULT_CLASS_NAME =
  'inline w-[12px] h-[12px] ml-4 text-black-low dark:text-white-low';

export const SnapshotLink = ({ iconClassName = DEFAULT_CLASS_NAME }: Props) => {
  return (
    <Navigate
      to={config.externalUrls.networkFeesSnapshotUrl}
      className="inline-flex items-center"
    >
      <IconInfo className={iconClassName} />
    </Navigate>
  );
};
