import { NavLink } from 'react-router-dom';
import { BaseMenuItem } from 'elements/sidebar/Sidebar';

interface NavSubItemProps extends BaseMenuItem {
  setIsSidebarOpen?: Function;
}

export const NavSubItem = ({
  label,
  to,
  setIsSidebarOpen,
}: NavSubItemProps) => {
  return (
    <NavLink
      exact
      strict
      to={to}
      onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
      activeClassName="!border-primary-light text-primary-light"
      className={`w-full flex items-center transition duration-300 border-l-2 border-grey-4 h-[28px] pl-30`}
    >
      {label}
    </NavLink>
  );
};
