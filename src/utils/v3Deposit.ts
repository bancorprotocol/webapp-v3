import { bntToken } from '../services/web3/config';

const V3_DEPOSIT_WHITELIST = [
  bntToken,
  '0xb2cABf797bc907B049e4cCB5b84d13be3a8CFC21',
  '0x444d6088B0F625f8C20192623B3C43001135E0fa',
];

export const checkV3DepositWhitelist = (token: string) =>
  V3_DEPOSIT_WHITELIST.includes(token);
