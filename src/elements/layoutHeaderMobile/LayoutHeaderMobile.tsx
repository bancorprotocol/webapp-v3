import 'elements/layoutHeaderMobile/LayoutHeaderMobile.css';
import { ReactComponent as IconWallet } from 'assets/icons/wallet.svg';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { ReactComponent as IconHamburger } from 'assets/icons/hamburger.svg';
import { ReactComponent as IconBell } from 'assets/icons/bell.svg';

export const LayoutHeaderMobile = () => {
  return (
    <div className="layout-header-mobile">
      <div className="layout-header-mobile-content text-white">
        <div>
          <IconHamburger className="w-[27px]" />
        </div>
        <div className="flex justify-center">
          <IconBancor className="w-[23px]" />
        </div>
        <div className="flex items-center justify-end">
          <div>
            <IconBell className="w-[22px]" />
          </div>
          <div className="bg-grey-4 w-[1px] h-30 mx-10">&#8203;</div>
          <IconWallet className="text-primary-light w-[22px]" />
        </div>
      </div>
    </div>
  );
};
