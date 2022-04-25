import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { ReactComponent as IconBancorv3 } from 'assets/logos/bancorv3.svg';
import { ReactComponent as IconSlogan } from 'assets/logos/discoverDefiSlogan.svg';
import { useDispatch } from 'react-redux';
import { setShowBanner } from 'store/user/user';
import { useCallback } from 'react';
import { useAppSelector } from 'store';

export const MarketingBanner = () => {
  const showBanner = useAppSelector<boolean>((state) => state.user.showBanner);

  const dispatch = useDispatch();
  const handleCloseBanner = useCallback(
    (e: any) => {
      e.preventDefault();
      dispatch(setShowBanner(false));
    },
    [dispatch]
  );

  return (
    <>
      {showBanner && (
        <div className="w-full max-w-[1140px] mx-auto sticky top-[80px]">
          <a
            href="https://try.bancor.network"
            target="_blank"
            className="hidden w-full md:flex pl-40 items-center bg-charcoal h-[60px] rounded"
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
      )}
    </>
  );
};
