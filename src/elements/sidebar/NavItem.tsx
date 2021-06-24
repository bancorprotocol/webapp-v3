import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { NavLink } from 'react-router-dom';
import { MenuItem } from 'elements/sidebar/Sidebar';
import { NavSubItem } from 'elements/sidebar/NavSubItem';
import { classNameGenerator } from 'utils/pureFunctions';

interface NavItemProps extends MenuItem {
  isActive: boolean;
  isMinimized: boolean;
}

export const NavItem = ({
  label,
  to,
  icon,
  subMenu,
  isActive,
  isMinimized,
}: NavItemProps) => {
  return (
    <>
      <NavLink
        to={to}
        exact
        strict
        activeClassName="text-primary-light border-primary-light"
        className={`flex items-center justify-between w-full text-16 font-semibold border-l-[5px] h-[44px] transition-all duration-500 ${
          isActive ? 'text-primary-light border-primary-light' : 'border-blue-4'
        }`}
      >
        <span className="flex items-center">
          <div className="w-20 mx-20">{icon}</div>
          {label}
        </span>
        {subMenu.length ? (
          <span className="pr-12">
            <IconChevron
              className={`w-16 transform transform-gpu transition-transform duration-500 ${classNameGenerator(
                { 'rotate-90': isActive }
              )}`}
            />
          </span>
        ) : (
          ''
        )}
      </NavLink>

      <div
        className={`ml-[35px] my-4 transition-all duration-700 ease-in-out overflow-hidden`}
        style={{
          height: `${isActive && !isMinimized ? subMenu.length * 28 : 0}px`,
        }}
      >
        {subMenu.map((subItem, index) => {
          return <NavSubItem {...subItem} key={index} />;
        })}
      </div>
    </>
  );
};
