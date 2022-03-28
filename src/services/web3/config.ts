import { APIToken } from 'services/api/bancor';
import { EthNetworks } from './types';
import { BigNumber } from 'bignumber.js';
import emptyTokenLogo from 'assets/logos/empty-token.webp';

export interface EthNetworkVariables {
  network: EthNetworks;
  contractRegistry: string;
  bntToken: string;
  converterContractForMaths: string;
  governanceContractAddress: string;
  etherscanUrl: string;
  govToken: string;
}

export const bntToken: string = '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C';
export const ethToken: string = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const zeroAddress: string = '0x0000000000000000000000000000000000000000';
export const wethToken: string = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const multiCallContract: string =
  '0x5ba1e12693dc8f9c48aad8770482f4739beed696';
export const ropstenImage: string = emptyTokenLogo;

export const bancorNetwork = '0x6210cE7207537eE1ec219f4562e6d05bed208852';
export const bancorNetworkInfo = '0x7a5D6EA7546f15d24b3a2519D80cc8Ec4B8f805A';
export const networkSettings = '0x093C761bd5B8f71d72cBC74A72cc9c6aEDC8EE49';
export const standardStakingRewards =
  '0x1d4Bf6aC01c71Ceaf96b2A25f18c3C75Db3B1EbD';
export const poolCollectionType1 = '0x7b0977cf6067585ABB49425BCA73E72EA982AE51';
export const pendingWithdrawals = '0x7Cd247CF8Df355Bc0C965026d482fB27CdcD7eA6';

const gasBuffer = 1.05;

export const changeGas = (gasEstimation: string) =>
  new BigNumber(gasEstimation).times(gasBuffer).toFixed(0);

// TODO - add weth token to observables
export const buildWethToken = (apiTokens?: APIToken[]): APIToken => {
  const eth = apiTokens && apiTokens.find((x) => x.dlt_id === ethToken);

  return {
    symbol: 'WETH',
    dlt_id: wethToken,
    liquidity: eth ? eth.liquidity : { usd: '0' },
    rate: eth ? eth.rate : { usd: '0' },
    rate_24h_ago: eth ? eth.rate_24h_ago : { usd: '0' },
    decimals: eth ? eth.decimals : 18,
    rates_7d: eth ? eth.rates_7d : [],
  };
};

export const getNetworkVariables = (): EthNetworkVariables => {
  return {
    network: EthNetworks.Mainnet,
    contractRegistry: '0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4',
    bntToken: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
    govToken: '0x48Fb253446873234F2fEBbF9BdeAA72d9d387f94',
    converterContractForMaths: '0xe870d00176b2c71afd4c43cea550228e22be4abd',
    governanceContractAddress: '0x892f481bd6e9d7d26ae365211d9b45175d5d00e4',
    etherscanUrl: 'https://etherscan.io',
  };
};

export const isMainNetFork = !!process.env.REACT_APP_BANCOR_V3_TEST_RPC_URL;
