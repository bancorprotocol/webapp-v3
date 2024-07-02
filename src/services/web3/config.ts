import { EthNetworks } from './types';
import { BigNumber } from 'bignumber.js';
import generic_token from 'assets/logos/generic_token.svg';
import { getTenderlyRpcLS } from 'utils/localStorage';

export interface EthNetworkVariables {
  network: EthNetworks;
  contractRegistry: string;
  bntToken: string;
  converterContractForMaths: string;
  governanceVbntContractAddress: string;
  governanceBntContractAddress: string;
  etherscanUrl: string;
  govToken: string;
}

export const bntToken: string = '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C';
export const wbtcToken: string = '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599';
export const usdcToken: string = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
export const usdtToken: string = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
export const systemStore: string = '0xc4C5634De585d43DaEC8fA2a6Fb6286cd9B87131';
export const ethToken: string = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const zeroAddress: string = '0x0000000000000000000000000000000000000000';
export const wethToken: string = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const multiCallContract: string =
  '0x5ba1e12693dc8f9c48aad8770482f4739beed696';
export const genericToken: string = generic_token;
export const zeroExProxyAddress = '0xdef1c0ded9bec7f1a1670819833240f027b25eff';
export const zeroExFeeRecipient = '0x5f7a009664B771E889751f4FD721aDc439033ECD';
export const bancorMasterVault = '0x649765821D9f64198c905eC0B2B037a4a52Bc373';
export const bntDecimals: number = 18;
export const vBntDecimals: number = 18;
const gasBuffer = 1.05;

export const changeGas = (gasEstimation: string) =>
  new BigNumber(gasEstimation).times(gasBuffer).toFixed(0);

export const getNetworkVariables = (): EthNetworkVariables => {
  return {
    network: EthNetworks.Mainnet,
    contractRegistry: '0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4',
    bntToken: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
    govToken: '0x48Fb253446873234F2fEBbF9BdeAA72d9d387f94',
    converterContractForMaths: '0xe870d00176b2c71afd4c43cea550228e22be4abd',
    governanceVbntContractAddress: '0x892f481bd6e9d7d26ae365211d9b45175d5d00e4',
    governanceBntContractAddress: '0xebFaFc802533F3D2835Af7464Fcd4492e8F82eB2',
    etherscanUrl: 'https://etherscan.io',
  };
};

export const isForkAvailable = !!getTenderlyRpcLS();
