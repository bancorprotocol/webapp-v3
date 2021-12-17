import { initialState as UserState } from 'redux/user/user';
import { Notification } from 'redux/notification/notification';

const selected_lists = 'userTokenLists';
const conversion = 'conversion';
const autoLogin = 'loginAuto';
const darkMode = 'darkMode';
const slippageTolerance = 'slippageTolerance';
const usdToggle = 'usdToggle';
const notifications = 'notifications';
const showBanner = 'showBanner';

export const getTokenListLS = (): string[] => {
  const list = localStorage.getItem(selected_lists);
  return list ? JSON.parse(list) : [];
};

export const setTokenListLS = (userListIds: string[]) => {
  localStorage.setItem(selected_lists, JSON.stringify(userListIds));
};

export const getConversionLS = () => {
  const conv = localStorage.getItem(conversion);
  if (conv) return JSON.parse(conv);
};

export const setConversionLS = (conv: any) => {
  localStorage.setItem(conversion, JSON.stringify(conv));
};

export const getAutoLoginLS = (): boolean => {
  const auto = localStorage.getItem(autoLogin);
  return auto && JSON.parse(auto);
};

export const setAutoLoginLS = (flag: boolean) => {
  localStorage.setItem(autoLogin, JSON.stringify(flag));
};

export const getDarkModeLS = (): boolean => {
  const dark = localStorage.getItem(darkMode);
  return dark && JSON.parse(dark);
};

export const setDarkModeLS = (flag: boolean) => {
  localStorage.setItem(darkMode, JSON.stringify(flag));
};

export const getSlippageToleranceLS = (): number => {
  const slippage = localStorage.getItem(slippageTolerance);
  if (slippage) return JSON.parse(slippage);

  return UserState.slippageTolerance;
};

export const setSlippageToleranceLS = (flag: number) => {
  localStorage.setItem(slippageTolerance, JSON.stringify(flag));
};

export const getUsdToggleLS = (): boolean => {
  const usd = localStorage.getItem(usdToggle);
  return usd && JSON.parse(usd);
};

export const setUsdToggleLS = (flag: boolean) => {
  localStorage.setItem(usdToggle, JSON.stringify(flag));
};

export const getNotificationsLS = (): Notification[] => {
  const notify = localStorage.getItem(notifications);
  return notify ? JSON.parse(notify) : [];
};

export const setNotificationsLS = (notify: Notification[]) => {
  localStorage.setItem(notifications, JSON.stringify(notify));
};

export const getShowBannerLS = (): boolean | undefined => {
  const show = localStorage.getItem(showBanner);
  return show ? JSON.parse(show) : undefined;
};

export const setShowBannerLS = (flag: boolean) => {
  localStorage.setItem(showBanner, JSON.stringify(flag));
};
