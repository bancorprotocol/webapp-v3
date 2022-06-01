import { DarkMode, initialState as UserState } from 'store/user/user';
import { Notification } from 'store/notification/notification';

const selected_lists = 'userTokenLists';
const autoLogin = 'loginAuto';
const darkMode = 'userDarkMode';
const slippageTolerance = 'slippageTolerance';
const usdToggle = 'usdToggle';
const notifications = 'notifications';
const tenderlyRpcUrl = 'tenderlyRpcUrl';
const v3ApiUrl = 'v3ApiUrl';
const v2ApiUrl = 'v2ApiUrl';

export const getTokenListLS = (): string[] => {
  const list = localStorage.getItem(selected_lists);
  return list ? JSON.parse(list) : [];
};

export const setTokenListLS = (userListIds: string[]) => {
  localStorage.setItem(selected_lists, JSON.stringify(userListIds));
};

export const getAutoLoginLS = (): boolean => {
  const auto = localStorage.getItem(autoLogin);
  return auto && JSON.parse(auto);
};

export const setAutoLoginLS = (flag: boolean) => {
  localStorage.setItem(autoLogin, JSON.stringify(flag));
};

export const getDarkModeLS = (): DarkMode => {
  const darkLS = localStorage.getItem(darkMode);
  if (darkLS) return Number(darkLS);

  return DarkMode.System;
};

export const setDarkModeLS = (mode: DarkMode) => {
  localStorage.setItem(darkMode, Number(mode).toString());
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

export const getTenderlyRpcLS = (): string => {
  return localStorage.getItem(tenderlyRpcUrl) || '';
};

export const setTenderlyRpcLS = (url?: string) => {
  if (url) {
    localStorage.setItem(tenderlyRpcUrl, url);
  } else {
    localStorage.removeItem(tenderlyRpcUrl);
  }
};

export const getV3ApiUrlLS = (): string => {
  return (
    localStorage.getItem(v3ApiUrl) ||
    'https://v3-staging-ptdczarhfq-nw.a.run.app/v3/'
  );
};

export const setV3ApiUrlLS = (url?: string) => {
  if (url) {
    localStorage.setItem(v3ApiUrl, url);
  } else {
    localStorage.removeItem(v3ApiUrl);
  }
};

export const getV2ApiUrlLS = (): string => {
  return localStorage.getItem(v2ApiUrl) || 'https://api-v2.bancor.network/';
};

export const setV2ApiUrlLS = (url?: string) => {
  if (url) {
    localStorage.setItem(v2ApiUrl, url);
  } else {
    localStorage.removeItem(v2ApiUrl);
  }
};
