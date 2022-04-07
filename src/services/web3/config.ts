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

export const isForkAvailable = true;
