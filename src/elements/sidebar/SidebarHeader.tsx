import { ReactComponent as IconBancor } from 'assets/icons/bancor.svg';
import { ReactComponent as IconBancorText } from 'assets/icons/bancorText.svg';
import { ReactComponent as IconChevron } from 'assets/icons/chevronRight.svg';
import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { classNameGenerator } from 'utils/pureFunctions';

interface SidebarHeaderProps {
  isMinimized: boolean;
  setIsMinimized: Function;
  setIsSidebarOpen?: Function;
}
export const SidebarHeader = ({
  isMinimized,
  setIsMinimized,
  setIsSidebarOpen,
}: SidebarHeaderProps) => {
  return (
    <>
      <div className={'flex justify-between items-center mb-12'}>
        <div className="flex items-center mb-5 pl-[25px] ">
          <IconBancor className="w-[18px] mr-20" />
          <IconBancorText className="w-[76px]" />
        </div>
        {setIsSidebarOpen ? (
          <button onClick={() => setIsSidebarOpen(false)} className="mr-14">
            <IconTimes className="w-15" />
          </button>
        ) : (
          ''
        )}
      </div>

      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className={'hidden md:block'}
      >
        <div
          className={`sidebar-toggle ${classNameGenerator({
            'rotate-180': !isMinimized,
          })}`}
        >
          <IconChevron className={`w-[16px] text-white`} />
        </div>
      </button>
    </>
  );
};
