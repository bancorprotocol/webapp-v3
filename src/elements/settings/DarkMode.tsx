import { ReactComponent as IconSun } from 'assets/icons/sun.svg';
import { ReactComponent as IconMoon } from 'assets/icons/moon.svg';
import { setDarkMode } from 'redux/user/user';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'redux/index';

export const DarkMode = () => {
  const dispatch = useDispatch();
  const darkMode = useAppSelector<boolean>((state) => state.user.darkMode);

  return (
    <>
      {darkMode ? (
        <button
          onClick={() => dispatch(setDarkMode(false))}
          className="flex items-center gap-10 text-white"
        >
          <IconSun className="w-20 text-white" />
          <div>Switch to light mode</div>
        </button>
      ) : (
        <button
          onClick={() => dispatch(setDarkMode(true))}
          className="flex items-center gap-10 text-black"
        >
          <IconMoon className="w-20" />
          <div>Switch to dark mode</div>
        </button>
      )}
    </>
  );
};
