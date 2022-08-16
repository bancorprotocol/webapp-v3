import { bntToken, ethToken } from '../services/web3/config';

const V3_DEPOSIT_WHITELIST = [bntToken, ethToken];

export const checkV3DepositWhitelist = (token: string) =>
  V3_DEPOSIT_WHITELIST.includes(token);
