import { Popover } from '@headlessui/react';
import { DropdownTransition } from 'components/transitions/DropdownTransition';
import { ReactComponent as IconCheck } from 'assets/icons/check.svg';
import { ReactComponent as IconBell } from 'assets/icons/bell.svg';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';

export const NotificationsMenu = () => {
  return (
    <Popover className="relative">
      <Popover.Button className="flex items-center">
        <IconBell className="w-[20px]" />
      </Popover.Button>

      <DropdownTransition>
        <Popover.Panel className="dropdown-menu">
          <div className="dropdown-bubble" />

          <div className="dropdown-header flex justify-between">
            <h3 className="text-16 font-semibold">Notifications</h3>
            <button className="text-12 underline">clear</button>
          </div>
          <div className="text-12">
            <div className="flex justify-between items-center mb-2">
              <div className="flex">
                <div className="flex items-center justify-center w-14 h-14 bg-success rounded-full">
                  <IconCheck className="w-8 text-white" />
                </div>
                <h4 className="text-12 font-medium mx-8">
                  Transaction in process
                </h4>
                <span className="text-grey-4">3 min ago</span>
              </div>
              <button>
                <IconTimes className="w-6" />
              </button>
            </div>
            <p className="ml-[22px] text-grey-4">Add 860 BNT to ETH/BNT pool</p>
          </div>
          <hr className="my-10 border-grey-3 border-opacity-50" />
          <div className="text-12">
            <div className="flex justify-between items-center mb-2">
              <div className="flex">
                <div className="flex items-center justify-center ">
                  <IconBancor className="absolute w-5 text-primary" />
                  <div className="absolute w-14 h-14 border border-grey-1 rounded-full"></div>
                  <div className="w-14 h-14 border-t border-r border-primary rounded-full animate-spin"></div>
                </div>

                <h4 className="text-12 font-medium mx-8">
                  Transaction in process
                </h4>
                <span className="text-grey-4">3 min ago</span>
              </div>
              <button>
                <IconTimes className="w-6" />
              </button>
            </div>
            <p className="ml-[22px] text-grey-4">Add 860 BNT to ETH/BNT pool</p>
          </div>
          <hr className="my-10" />
          <div className="text-12">
            <div className="flex justify-between items-center mb-2">
              <div className="flex">
                <div className="flex items-center justify-center w-14 h-14 bg-success rounded-full">
                  <IconCheck className="w-8 text-white" />
                </div>
                <h4 className="text-12 font-medium mx-8">
                  Transaction in process
                </h4>
                <span className="text-grey-4">3 min ago</span>
              </div>
              <button>
                <IconTimes className="w-6" />
              </button>
            </div>
            <p className="ml-[22px] text-grey-4">Add 860 BNT to ETH/BNT pool</p>
          </div>
          <hr className="my-10" />
          <div className="text-12">
            <div className="flex justify-between items-center mb-2">
              <div className="flex">
                <div className="flex items-center justify-center w-14 h-14 bg-success rounded-full">
                  <IconCheck className="w-8 text-white" />
                </div>
                <h4 className="text-12 font-medium mx-8">
                  Transaction in process
                </h4>
                <span className="text-grey-4">3 min ago</span>
              </div>
              <button>
                <IconTimes className="w-6" />
              </button>
            </div>
            <p className="ml-[22px] text-grey-4">Add 860 BNT to ETH/BNT pool</p>
          </div>
          <hr className="my-10" />
          <div className="text-12">
            <div className="flex justify-between items-center mb-2">
              <div className="flex">
                <div className="flex items-center justify-center w-14 h-14 bg-success rounded-full">
                  <IconCheck className="w-8 text-white" />
                </div>
                <h4 className="text-12 font-medium mx-8">
                  Transaction in process
                </h4>
                <span className="text-grey-4">3 min ago</span>
              </div>
              <button>
                <IconTimes className="w-6" />
              </button>
            </div>
            <p className="ml-[22px] text-grey-4">Add 860 BNT to ETH/BNT pool</p>
          </div>
        </Popover.Panel>
      </DropdownTransition>
    </Popover>
  );
};
