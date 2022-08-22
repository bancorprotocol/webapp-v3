import { ReactComponent as IconLink } from 'assets/icons/link.svg';
import { useAppSelector } from 'store/index';
import { useMemo } from 'react';

export const ProtectedSettingsV3 = ({
  asLink = false,
}: {
  asLink?: boolean;
}) => {
  const { withdrawalFee, lockDuration } = useAppSelector(
    (state) => state.v3Portfolio.withdrawalSettings
  );

  const lockDurationInDays = useMemo(
    () => lockDuration / 60 / 60 / 24,
    [lockDuration]
  );

  const withdrawalFeeInPercent = useMemo(
    () => (withdrawalFee * 100).toFixed(2),
    [withdrawalFee]
  );

  const text = `${
    lockDurationInDays < 1 ? '< 1' : lockDurationInDays
  } day cooldown • ${withdrawalFeeInPercent}% withdrawal fee`;

  const textClass =
    'flex items-center text-secondary text-[13px] justify-center';

  if (!asLink) {
    return <div className={textClass}>{text}</div>;
  }
  return (
    <a
      href={
        'https://support.bancor.network/hc/en-us/articles/4676348348818-Why-is-there-a-withdrawal-fee-and-cooldown'
      }
      target="_blank"
      className={`${textClass}`}
      rel="noreferrer"
    >
      {text}
      <IconLink className="w-14 ml-6" />
    </a>
  );
};
