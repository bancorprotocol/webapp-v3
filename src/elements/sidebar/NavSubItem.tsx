import { NavLink } from 'react-router-dom';
import { BaseMenuItem } from 'elements/sidebar/Sidebar';

export const NavSubItem = ({ label, to }: BaseMenuItem) => {
  return (
    <NavLink
      exact
      strict
      to={to}
      activeClassName="!border-primary-light text-primary-light"
      className={`w-full flex items-center transition duration-300 border-l-2 border-grey-4 h-[28px] pl-30`}
    >
      {label}
    </NavLink>
  );
};
