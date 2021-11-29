import { ReactComponent as IconTimes } from '../../assets/icons/times.svg';
import { ReactComponent as IconBancorv3 } from '../../assets/logos/bancorv3mobile.svg';
import { useDispatch } from 'react-redux';
import { setShowBanner } from '../../redux/user/user';

export const MarketingBannerMobile = () => {
  const dispatch = useDispatch();
  const handleCloseBanner = () => {
    dispatch(setShowBanner(false));
  };
  return (
    <div className="flex items-center justify-center fixed top-[75px] w-full h-40 bg-blue-4 text-white border-t z-30">
      <button
        className="absolute right-20 p-10"
        onClick={() => handleCloseBanner()}
      >
        <IconTimes className="w-12" />
      </button>
      <IconBancorv3 />
    </div>
  );
};
