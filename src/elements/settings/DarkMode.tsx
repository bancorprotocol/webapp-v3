import { ReactComponent as IconSun } from 'assets/icons/sun.svg';
import { ReactComponent as IconMoon } from 'assets/icons/moon.svg';
import { DarkMode as IDarkMode, setDarkMode } from 'store/user/user';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'store';

export const DarkMode = ({ showText = false }: { showText?: boolean }) => {
  const darkMode = useAppSelector<IDarkMode>((state) => state.user.darkMode);

  return (
    <>
      {darkMode === IDarkMode.Dark ? (
        <DarkModeButton modeToSwitch={IDarkMode.Light}>
          <>
            <IconSun className="w-20" />
            {showText && <div>Switch to Light Mode</div>}
          </>
        </DarkModeButton>
      ) : darkMode === IDarkMode.Light ? (
        <DarkModeButton modeToSwitch={IDarkMode.System}>
          <>
            <IconMoon className="w-20" />
            {showText && <div>Switch to System Mode</div>}
          </>
        </DarkModeButton>
      ) : (
        <DarkModeButton modeToSwitch={IDarkMode.Dark}>
          <>
            <IconMoon className="w-20" />
            {showText && <div>Switch to Dark Mode</div>}
          </>
        </DarkModeButton>
      )}
    </>
  );
};

const DarkModeButton = ({
  modeToSwitch,
  children,
}: {
  modeToSwitch: IDarkMode;
  children: JSX.Element;
}) => {
  const dispatch = useDispatch();
  return (
    <button
      onClick={() => dispatch(setDarkMode(modeToSwitch))}
      className="flex items-center gap-10 text-black dark:text-white"
    >
      {children}
    </button>
  );
};
