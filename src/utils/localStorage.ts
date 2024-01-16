import { DarkMode, initialState as UserState } from 'store/user/user';
import { Notification } from 'store/notification/notification';
import { isProduction } from 'utils/constants';
import { uniq } from 'lodash';

const selected_lists = 'userSelectedTokenLists';
const autoLogin = 'loginAuto';
const darkMode = 'userDarkMode';
const slippageTolerance = 'slippageTolerance';
const notifications = 'notifications';
const tenderlyRpcUrl = 'tenderlyRpcUrl';
const v3ApiUrl = 'v3ApiUrl';
const v2ApiUrl = 'v2ApiUrl';
const forceV3 = 'forceV3';
const forceV2 = 'forceV2';
const enableDeposit = 'enableDeposit';
const pageRows = 'pageRows';
const migrationDisabledActive = 'migrationDisabledActive';

const deprecated_cleanup = [
  'userTokenLists',
  'migrationDisabled',
  'migrationDisabledV2',
  'migrationIntermediate',
];

deprecated_cleanup.forEach((k) => localStorage.removeItem(k));

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
  if (darkLS !== null) return Number(darkLS);

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

export const getNotificationsLS = (): Notification[] => {
  const notify = localStorage.getItem(notifications);
  return notify ? JSON.parse(notify) : [];
};

export const setNotificationsLS = (notify: Notification[]) => {
  localStorage.setItem(notifications, JSON.stringify(notify));
};

export const getTenderlyRpcLS = (): string => {
  // if production ENV remove tenderly locale storage
  if (isProduction) {
    setTenderlyRpcLS();
  }
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
  return 'https://temp-v3-ptdczarhfq-nw.a.run.app';
};

export const setV3ApiUrlLS = (url?: string) => {
  if (url) {
    localStorage.setItem(v3ApiUrl, url);
  } else {
    localStorage.removeItem(v3ApiUrl);
  }
};

export const getV2ApiUrlLS = (): string => {
  return 'https://temp-v2-ptdczarhfq-nw.a.run.app';
};

export const setV2ApiUrlLS = (url?: string) => {
  if (url) {
    localStorage.setItem(v2ApiUrl, url);
  } else {
    localStorage.removeItem(v2ApiUrl);
  }
};

export const getMigrationDisabledLS = (user?: string | null): boolean => {
  const migration = localStorage.getItem(migrationDisabledActive);
  const list = migration ? JSON.parse(migration) : [];
  return list.includes(user);
};

export const setMigrationDisabledLS = (user?: string | null) => {
  if (!user) return;

  const migration = localStorage.getItem(migrationDisabledActive);
  const list = migration ? JSON.parse(migration) : [];

  localStorage.setItem(
    migrationDisabledActive,
    JSON.stringify(uniq([...list, user]))
  );
};

export const resetTenderly = () => {
  localStorage.removeItem(tenderlyRpcUrl);
  localStorage.removeItem(forceV3);
  localStorage.removeItem(forceV2);
  localStorage.removeItem(enableDeposit);
};

export const getPageRowsLS = (): number => {
  const rows = localStorage.getItem(pageRows);
  if (rows) return JSON.parse(rows);

  return 10;
};

export const setpageRowsLS = (rows: number) => {
  localStorage.setItem(pageRows, JSON.stringify(rows));
};

export const getForceV3LS = (): boolean => {
  const force = localStorage.getItem(forceV3);
  return force && JSON.parse(force);
};

export const setForceV3LS = (flag: boolean) => {
  localStorage.setItem(forceV3, JSON.stringify(flag));
};

export const getForceV2LS = (): boolean => {
  const force = localStorage.getItem(forceV2);
  return force && JSON.parse(force);
};

export const setForceV2LS = (flag: boolean) => {
  localStorage.setItem(forceV2, JSON.stringify(flag));
};
