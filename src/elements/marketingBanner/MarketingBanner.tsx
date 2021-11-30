import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { ReactComponent as IconBancorv3 } from 'assets/logos/bancorv3.svg';
import { ReactComponent as IconSlogan } from 'assets/logos/discoverDefiSlogan.svg';
import { useDispatch } from 'react-redux';
import { setShowBanner } from 'redux/user/user';
import { useCallback } from 'react';

export const MarketingBanner = () => {
  const dispatch = useDispatch();
  const handleCloseBanner = useCallback(
    (e: any) => {
      e.preventDefault();
      dispatch(setShowBanner(false));
    },
    [dispatch]
  );

  return (
    <div className="w-full max-w-[1140px] mx-auto sticky top-[80px] z-30">
      <a
        href="https://try.bancor.network"
        target="_blank"
        className="hidden w-full md:flex pl-40 items-center bg-blue-4 h-[60px] rounded"
        rel="noreferrer"
      >
        <button
          className="absolute right-20 p-10 text-white"
          onClick={handleCloseBanner}
        >
          <IconTimes className="w-12" />
        </button>
        <IconBancorv3 className="mr-20" />
        <IconSlogan />
      </a>
    </div>
  );
};
