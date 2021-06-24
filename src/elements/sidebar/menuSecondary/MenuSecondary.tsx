import { ReactComponent as IconApps } from 'assets/icons/apps.svg';
import { ReactComponent as IconCommunity } from 'assets/icons/community.svg';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { ReactComponent as IconDeveloper } from 'assets/icons/developers.svg';

interface MenuSecondaryProps {
  isMinimized: boolean;
  setIsSidebarOpen?: Function;
}

export const MenuSecondary = ({
  isMinimized,
  setIsSidebarOpen,
}: MenuSecondaryProps) => {
  return (
    <>
      <hr className="mx-20" />
      <div className="p-20 text-12 space-y-16">
        <button className="w-full flex items-center justify-between">
          <span className="flex items-center">
            <IconApps className="ml-5 mr-20" />
            Apps
          </span>
          <span>
            <IconChevron className="w-16" />
          </span>
        </button>

        <button className="w-full flex items-center justify-between">
          <span className="flex items-center">
            <IconCommunity className="ml-5 mr-20" />
            Community
          </span>
          <span>
            <IconChevron className="w-16" />
          </span>
        </button>

        <button className="w-full flex items-center justify-between">
          <span className="flex items-center">
            <IconDeveloper className="ml-5 mr-20" />
            Developer
          </span>
          <span>
            <IconChevron className="w-16" />
          </span>
        </button>
      </div>
    </>
  );
};
