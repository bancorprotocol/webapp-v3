import 'elements/layoutHeader/LayoutHeader.css';

interface LayoutHeaderMobileProps {
  children: JSX.Element | JSX.Element[];
}
export const LayoutHeaderMobile = ({ children }: LayoutHeaderMobileProps) => {
  return (
    <header className="layout-header-mobile">
      <div className="layout-header-mobile-content text-white">{children}</div>
    </header>
  );
};
