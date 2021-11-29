import { ReactComponent as IconTimes } from '../../assets/icons/times.svg';
import { ReactComponent as IconBancorv3 } from '../../assets/logos/bancorv3.svg';
import { ReactComponent as IconSlogan } from '../../assets/logos/discoverDefiSlogan.svg';
import { useDispatch } from 'react-redux';
import { setShowBanner } from '../../redux/user/user';

export const MarketingBanner = () => {
  const dispatch = useDispatch();
  const handleCloseBanner = () => {
    dispatch(setShowBanner(false));
  };
  return (
    <div className="flex justify-center items-center bg-blue-4 border-b border-[#5D687A] w-full absolute top-0 h-[80px] text-white">
      <button
        className="absolute right-20 p-10"
        onClick={() => handleCloseBanner()}
      >
        <IconTimes className="w-16" />
      </button>
      <IconBancorv3 className="mr-20" />
      <IconSlogan />
    </div>
  );
};
