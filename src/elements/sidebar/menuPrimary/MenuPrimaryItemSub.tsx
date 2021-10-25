import { NavLink } from 'react-router-dom';
import { BaseMenuItem } from 'elements/sidebar/menuPrimary/MenuPrimary';
import { ReactComponent as IconLink } from 'assets/icons/link.svg';

interface NavSubItemProps extends BaseMenuItem {
  setIsSidebarOpen?: Function;
}

export const MenuPrimaryItemSub = ({
  label,
  to,
  setIsSidebarOpen,
}: NavSubItemProps) => {
  const href = to.startsWith('http');
  return (
    <NavLink
      exact
      strict
      to={{ pathname: to }}
      target={href ? '_blank' : undefined}
      rel={href ? 'noopener' : undefined}
      onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
      activeClassName="!border-primary-light text-primary-light"
      className={`w-full flex items-center transition duration-300 border-l-2 border-grey-4 h-[28px] pl-30`}
    >
      {label} {href && <IconLink className="w-14 ml-6" />}
    </NavLink>
  );
};
