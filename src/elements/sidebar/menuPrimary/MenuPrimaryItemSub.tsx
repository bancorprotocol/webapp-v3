import { NavLink } from 'react-router-dom';
import { BaseMenuItem } from 'elements/sidebar/menuPrimary/MenuPrimary';

interface NavSubItemProps extends BaseMenuItem {
  setIsSidebarOpen?: Function;
}

export const MenuPrimaryItemSub = ({
  label,
  to,
  setIsSidebarOpen,
}: NavSubItemProps) => {
  return (
    <NavLink
      exact
      strict
      to={{ pathname: to }}
      target={to.startsWith('http') ? '_blank' : undefined}
      onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
      activeClassName="!border-primary-light text-primary-light"
      className={`w-full flex items-center transition duration-300 border-l-2 border-grey-4 h-[28px] pl-30`}
    >
      {label}
    </NavLink>
  );
};
