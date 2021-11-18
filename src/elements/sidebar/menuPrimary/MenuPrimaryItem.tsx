import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { NavLink } from 'react-router-dom';
import { MenuPrimaryItemSub } from 'elements/sidebar/menuPrimary/MenuPrimaryItemSub';
import { classNameGenerator } from 'utils/pureFunctions';
import { MenuItem } from 'elements/sidebar/menuPrimary/MenuPrimary';

interface MenuPrimaryItemProps extends MenuItem {
  isActive: boolean;
  isMinimized: boolean;
  setIsSidebarOpen?: Function;
}

export const MenuPrimaryItem = ({
  label,
  to,
  icon,
  subMenu,
  isActive,
  isMinimized,
  setIsSidebarOpen,
}: MenuPrimaryItemProps) => {
  return (
    <>
      <NavLink
        to={to}
        exact
        strict
        activeClassName="text-primary-light border-primary-light"
        className={`flex items-center justify-between w-full text-16 font-medium border-l-[5px] h-[44px] transition-all duration-500 ${
          isActive
            ? 'text-primary-light border-primary-light'
            : 'border-blue-4 border-l-[5px] hover:border-grey-0'
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
        className={`ml-[35px] transition-all duration-500 ease-in-out overflow-hidden`}
        style={{
          height: `${isActive && !isMinimized ? subMenu.length * 28 : 0}px`,
        }}
      >
        {subMenu.map((subItem, index) => {
          return (
            <MenuPrimaryItemSub
              key={index}
              {...subItem}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          );
        })}
      </div>
    </>
  );
};
