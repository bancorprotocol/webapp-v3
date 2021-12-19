import { ReactComponent as IconSun } from 'assets/icons/sun.svg';
import { ReactComponent as IconMoon } from 'assets/icons/moon.svg';
import { setDarkMode } from 'redux/user/user';
import { useDispatch } from 'react-redux';
import { useAppSelector } from 'redux/index';

export const DarkMode = () => {
  const dispatch = useDispatch();
  const darkMode = useAppSelector<boolean>((state) => state.user.darkMode);

  return (
    <button onClick={() => dispatch(setDarkMode(!darkMode))}>
      {darkMode ? <IconSun className="w-20" /> : <IconMoon className="w-15" />}
    </button>
  );
};
