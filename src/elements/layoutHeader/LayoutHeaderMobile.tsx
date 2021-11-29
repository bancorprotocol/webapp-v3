import 'elements/layoutHeader/LayoutHeader.css';
import { useAppSelector } from '../../redux';

interface LayoutHeaderMobileProps {
  children: JSX.Element | JSX.Element[];
}
export const LayoutHeaderMobile = ({ children }: LayoutHeaderMobileProps) => {
  const showBanner = useAppSelector<boolean>((state) => state.user.showBanner);
  return (
    <header className={`${showBanner ? 'h-[115px]' : ''} relative`}>
      <div className="layout-header-mobile h-[75px]">
        <div className="layout-header-mobile-content text-white">
          {children}
        </div>
      </div>
    </header>
  );
};
