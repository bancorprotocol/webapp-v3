import 'elements/layoutHeader/LayoutHeader.css';

interface LayoutHeaderMobileProps {
  children: JSX.Element | JSX.Element[];
}
export const LayoutHeaderMobile = ({ children }: LayoutHeaderMobileProps) => {
  return (
    <header className="h-[115px] relative">
      <div className="layout-header-mobile h-[75px]">
        <div className="layout-header-mobile-content text-white">
          {children}
        </div>
      </div>
      <div className="absolute sticky top-[75px] w-full h-40 bg-blue-4 border-t">
        marketing banner
      </div>
    </header>
  );
};
