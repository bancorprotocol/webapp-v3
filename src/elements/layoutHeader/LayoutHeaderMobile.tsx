import 'elements/layoutHeader/LayoutHeader.css';
import { ReactComponent as IconWallet } from 'assets/icons/wallet.svg';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { ReactComponent as IconHamburger } from 'assets/icons/hamburger.svg';
import { NotificationsMenu } from 'elements/notifications/NotificationsMenu';

interface LayoutHeaderMobileProps {
  setIsSidebarOpen: Function;
}
export const LayoutHeaderMobile = ({
  setIsSidebarOpen,
}: LayoutHeaderMobileProps) => {
  return (
    <header className="layout-header-mobile">
      <div className="layout-header-mobile-content text-white">
        <button onClick={() => setIsSidebarOpen(true)}>
          <IconHamburger className="w-[27px]" />
        </button>
        <div className="flex justify-center">
          <IconBancor className="w-[23px]" />
        </div>
        <div className="flex items-center justify-end">
          <NotificationsMenu />
          <div className="bg-grey-4 w-[1px] h-30 mx-10">&#8203;</div>
          <IconWallet className="text-primary-light w-[22px]" />
        </div>
      </div>
    </header>
  );
};
