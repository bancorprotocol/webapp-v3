import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface MenuSubItem {
  id: number;
  label: string;
  to: string;
}

export interface MenuItem {
  id: number;
  label: string;
  to: string;
  icon: JSX.Element;
  // icon: FunctionComponent<SVGProps<SVGSVGElement>>;
  subMenu: MenuSubItem[];
}

export const NavItem = ({ item }: { item: MenuItem }) => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div>
      <NavLink
        to={item.to}
        exact
        strict
        activeClassName="text-primary-light border-primary-light"
        isActive={(match, location) => {
          console.log('test');
          if (!match) {
            setIsActive(false);
            return false;
          }

          setIsActive(true);
          return true;
        }}
        className={`flex items-center justify-between w-full text-16 font-semibold border-l-[5px] h-[44px] transition-all duration-500 ${
          isActive ? 'text-primary-light border-primary-light' : 'border-blue-4'
        }`}
      >
        <span className="flex items-center">
          <div className="w-20 mx-20">{item.icon}</div>
          {item.label}
        </span>
        <span className="pr-12">
          <IconChevron
            className={`w-16 transform transform-gpu transition-transform duration-500 ${
              isActive ? 'rotate-90' : ''
            }`}
          />
        </span>
      </NavLink>

      <div
        className={`ml-[35px] my-4 transition-all duration-500 ease-in-out overflow-hidden ${
          isActive ? 'h-56' : 'h-0'
        }`}
      >
        {item.subMenu.map((subItem) => {
          return (
            <NavLink
              to={subItem.to}
              activeClassName="border-primary-light text-primary-light"
              className={`w-full flex items-center text-left border-l-2 border-grey-4 h-[28px] pl-30`}
            >
              {subItem.label}
            </NavLink>
          );
        })}
        {/*<button className="w-full text-left border-l-2 border-primary-light text-primary-light h-[28px] pl-30">*/}
        {/*  Earn*/}
        {/*</button>*/}

        {/*<button className="border-l-2 border-grey-4 h-[28px] pl-30">*/}
        {/*  Earn*/}
        {/*</button>*/}
      </div>
    </div>
  );
};
