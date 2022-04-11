import { initialState as UserState } from 'redux/user/user';
import { Notification } from 'redux/notification/notification';
import { address as bancorNetworkAddress } from 'services/web3/abis/v3/BancorNetworkV3.json';
import { address as bancorNetworkInfoAddress } from 'services/web3/abis/v3/BancorNetworkInfo.json';
import { address as networkSettingsAddress } from 'services/web3/abis/v3/NetworkSettings.json';
import { address as pendingWithdrawalsAddress } from 'services/web3/abis/v3/PendingWithdrawals.json';
import { address as poolCollectionType1Address } from 'services/web3/abis/v3/PoolCollectionType1.json';
import { address as standardStakingRewardsAddress } from 'services/web3/abis/v3/StandardStakingRewards.json';

import { address as testToken1Address } from 'services/web3/abis/v3/TestToken1.json';
import { address as testToken2Address } from 'services/web3/abis/v3/TestToken2.json';
import { address as testToken3Address } from 'services/web3/abis/v3/TestToken3.json';
import { address as testToken4Address } from 'services/web3/abis/v3/TestToken4.json';
import { address as testToken5Address } from 'services/web3/abis/v3/TestToken5.json';

const selected_lists = 'userTokenLists';
const autoLogin = 'loginAuto';
const darkMode = 'darkMode';
const slippageTolerance = 'slippageTolerance';
const usdToggle = 'usdToggle';
const notifications = 'notifications';
const showBanner = 'showBanner';
const tenderlyRpcUrl = 'tenderlyRpcUrl';
const contractBancorNetwork = 'contractBancorNetwork';
const contractBancorNetworkInfo = 'contractBancorNetworkInfo';
const contractNetworkSettings = 'contractNetworkSettings';
const contractPendingWithdrawals = 'contractPendingWithdrawals';
const contractPoolCollection = 'contractPoolCollection';
const contractStandardStakingRewards = 'contractStandardStakingRewards';
const contractTKN1 = 'contractTKN1';
const contractTKN2 = 'contractTKN2';
const contractTKN3 = 'contractTKN3';
const contractTKN4 = 'contractTKN4';
const contractTKN5 = 'contractTKN5';

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

export const getTenderlyRpcLS = (): string => {
  const url = localStorage.getItem(tenderlyRpcUrl);
  return url || '';
};

export const setTenderlyRpcLS = (url: string) => {
  localStorage.setItem(tenderlyRpcUrl, url);
};

export const getContractBancorNetworkLS = (): string => {
  const url = localStorage.getItem(contractBancorNetwork);
  return url || bancorNetworkAddress;
};

export const setContractBancorNetworkLS = (address: string) => {
  localStorage.setItem(contractBancorNetwork, address);
};

export const getContractBancorNetworkInfoLS = (): string => {
  const url = localStorage.getItem(contractBancorNetworkInfo);
  return url || bancorNetworkInfoAddress;
};

export const setContractBancorNetworkInfoLS = (address: string) => {
  localStorage.setItem(contractBancorNetworkInfo, address);
};

export const getContractNetworkSettingsLS = (): string => {
  const url = localStorage.getItem(contractNetworkSettings);
  return url || networkSettingsAddress;
};

export const setContractNetworkSettingsLS = (address: string) => {
  localStorage.setItem(contractNetworkSettings, address);
};

export const getContractPendingWithdrawalsLS = (): string => {
  const url = localStorage.getItem(contractPendingWithdrawals);
  return url || pendingWithdrawalsAddress;
};

export const setContractPendingWithdrawalsLS = (address: string) => {
  localStorage.setItem(contractPendingWithdrawals, address);
};

export const getContractPoolCollectionLS = (): string => {
  const url = localStorage.getItem(contractPoolCollection);
  return url || poolCollectionType1Address;
};

export const setContractPoolCollectionLS = (address: string) => {
  localStorage.setItem(contractPoolCollection, address);
};

export const getContractStandardStakingRewardsLS = (): string => {
  const url = localStorage.getItem(contractStandardStakingRewards);
  return url || standardStakingRewardsAddress;
};

export const setContractStandardStakingRewardsLS = (address: string) => {
  localStorage.setItem(contractStandardStakingRewards, address);
};

export const getContractTestToken1LS = (): string => {
  const url = localStorage.getItem(contractTKN1);
  return url || testToken1Address;
};

export const setContractTestToken1LS = (address: string) => {
  localStorage.setItem(contractTKN1, address);
};

export const getContractTestToken2LS = (): string => {
  const url = localStorage.getItem(contractTKN2);
  return url || testToken2Address;
};

export const setContractTestToken2LS = (address: string) => {
  localStorage.setItem(contractTKN2, address);
};

export const getContractTestToken3LS = (): string => {
  const url = localStorage.getItem(contractTKN3);
  return url || testToken3Address;
};

export const setContractTestToken3LS = (address: string) => {
  localStorage.setItem(contractTKN3, address);
};

export const getContractTestToken4LS = (): string => {
  const url = localStorage.getItem(contractTKN4);
  return url || testToken4Address;
};

export const setContractTestToken4LS = (address: string) => {
  localStorage.setItem(contractTKN4, address);
};

export const getContractTestToken5LS = (): string => {
  const url = localStorage.getItem(contractTKN5);
  return url || testToken5Address;
};

export const setContractTestToken5LS = (address: string) => {
  localStorage.setItem(contractTKN5, address);
};
