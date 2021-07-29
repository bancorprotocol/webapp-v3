import { useState } from 'react';
import { MenuPrimary } from 'elements/sidebar/menuPrimary/MenuPrimary';
import { SidebarHeader } from 'elements/sidebar/SidebarHeader';
import { MenuSecondary } from 'elements/sidebar/menuSecondary/MenuSecondary';
import { SidebarFooter } from 'elements/sidebar/SidebarFooter';

interface SidebarProps {
  isMinimized: boolean;
  setIsMinimized: Function;
  setIsSidebarOpen?: Function;
}

export const Sidebar = ({
  isMinimized,
  setIsMinimized,
  setIsSidebarOpen,
}: SidebarProps) => {
  return (
    <div
      className={`fixed h-full text-grey-2 transition-all duration-500 ease-in-out z-20 ${
        isMinimized ? 'w-[66px]' : 'w-[200px]'
      }`}
    >
      <div className="pt-[25px] h-full bg-blue-4 rounded-r">
        <div className="flex flex-col justify-between h-full">
          <section className="overflow-hidden overflow-y-auto">
            <SidebarHeader
              isMinimized={isMinimized}
              setIsMinimized={setIsMinimized}
              setIsSidebarOpen={setIsSidebarOpen}
            />

            <MenuPrimary
              isMinimized={isMinimized}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </section>
          <section>
            <MenuSecondary isMinimized={isMinimized} />
            <SidebarFooter isMinimized={isMinimized} />
          </section>
        </div>
      </div>
    </div>
  );
};
