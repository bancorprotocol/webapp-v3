import { ReactComponent as IconTimes } from 'assets/icons/times.svg';

export const MobileSidebar = ({
  children,
  setShow,
  show,
}: {
  children: JSX.Element;
  setShow: Function;
  show: boolean;
}) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full transition-all duration-500 ease-in-out z-50 ${
        show ? 'w-[85%]' : 'w-0'
      }`}
    >
      <div className="h-full bg-white dark:bg-black rounded-r z-50">
        <div className="flex flex-col justify-between h-full">
          <div className="overflow-hidden overflow-y-auto">
            <div className="flex justify-end mx-20 h-[70px]">
              <button
                onClick={() => setShow(false)}
                className="justify-self-right"
              >
                <IconTimes className="w-20 align-right" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
