import { bntToken } from '../services/web3/config';

const CROWN_TOKEN_ADDRESS = '0x444d6088B0F625f8C20192623B3C43001135E0fa';
const ACRE_TOKEN_ADDRESS = '0xb2cABf797bc907B049e4cCB5b84d13be3a8CFC21';

const V3_DEPOSIT_WHITELIST = [
  bntToken,
  CROWN_TOKEN_ADDRESS,
  ACRE_TOKEN_ADDRESS,
];

export const checkV3DepositWhitelist = (token: string) =>
  V3_DEPOSIT_WHITELIST.includes(token);
