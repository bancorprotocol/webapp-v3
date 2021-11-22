import { APIToken, APIPool } from 'services/api/bancor';
import { UTCTimestamp } from 'lightweight-charts';
import { Token } from 'services/observables/tokens';
import { calculatePercentageChange } from 'utils/formulas';
import { get7DaysAgo } from 'utils/pureFunctions';
import { EthNetworks } from './types';
import { BigNumber } from 'bignumber.js';

export interface EthNetworkVariables {
  network: EthNetworks;
  contractRegistry: string;
  bntToken: string;
  converterContractForMaths: string;
  governanceContractAddress: string;
  etherscanUrl: string;
  govToken: string;
}

export const ethToken: string = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const zeroAddress: string = '0x0000000000000000000000000000000000000000';
export const wethToken: string = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const multiCallContract: string =
  '0x5ba1e12693dc8f9c48aad8770482f4739beed696';
export const ropstenImage: string =
  'https://ropsten.etherscan.io/images/main/empty-token.png';

const gasBuffer = 1.05;

export const changeGas = (gasEstimation: string) =>
  new BigNumber(gasEstimation).times(gasBuffer).toFixed(0);

export const buildWethToken = (apiTokens?: APIToken[]): APIToken => {
  const eth = apiTokens && apiTokens.find((x) => x.dlt_id === ethToken);

  return {
    symbol: 'WETH',
    dlt_id: wethToken,
    liquidity: eth ? eth.liquidity : { usd: null },
    rate: eth ? eth.rate : { usd: null },
    rate_24h_ago: eth ? eth.rate_24h_ago : { usd: null },
    decimals: eth ? eth.decimals : 18,
    rates_7d: eth ? eth.rates_7d : [],
  };
};

export const getEthToken = (
  apiTokens: APIToken[],
  pools: APIPool[]
): Token | null => {
  const eth = apiTokens.find((apiToken) => apiToken.dlt_id === ethToken);
  if (eth) {
    const price = eth.rate.usd;
    const price_24h = eth.rate_24h_ago.usd;
    const priceChanged =
      price && price_24h && Number(price_24h) !== 0
        ? calculatePercentageChange(Number(price), Number(price_24h))
        : 0;
    const pool = pools.find((p) =>
      p.reserves.find((r) => r.address === eth.dlt_id)
    );
    const usdVolume24 = pool ? pool.volume_24h.usd : null;
    const isWhitelisted = pool ? pool.isWhitelisted : false;
    const seven_days_ago = get7DaysAgo().getUTCSeconds();

    return {
      address: eth.dlt_id,
      logoURI: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
      name: 'Ethereum',
      chainId: 1,
      balance: null,
      symbol: eth.symbol,
      decimals: eth.decimals,
      usdPrice: price,
      liquidity: eth.liquidity.usd,
      usd_24h_ago: price_24h,
      price_change_24: priceChanged,
      price_history_7d: eth.rates_7d
        .filter((x) => !!x)
        .map((x, i) => ({
          value: Number(x),
          time: (seven_days_ago + i * 360) as UTCTimestamp,
        })),
      usd_volume_24: usdVolume24,
      isWhitelisted,
    };
  }

  return null;
};

export const getNetworkVariables = (
  ethNetwork: EthNetworks
): EthNetworkVariables => {
  switch (ethNetwork) {
    case EthNetworks.Mainnet:
      return {
        network: EthNetworks.Mainnet,
        contractRegistry: '0x52Ae12ABe5D8BD778BD5397F99cA900624CfADD4',
        bntToken: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
        govToken: '0x48Fb253446873234F2fEBbF9BdeAA72d9d387f94',
        converterContractForMaths: '0xe870d00176b2c71afd4c43cea550228e22be4abd',
        governanceContractAddress: '0x892f481bd6e9d7d26ae365211d9b45175d5d00e4',
        etherscanUrl: 'https://etherscan.io',
      };
    case EthNetworks.Ropsten:
      return {
        network: EthNetworks.Ropsten,
        contractRegistry: '0xA6DB4B0963C37Bc959CbC0a874B5bDDf2250f26F',
        bntToken: '0xF35cCfbcE1228014F66809EDaFCDB836BFE388f5',
        govToken: '0x83ec8129b1F54BA5b0f47bD902A79C803e20A249',
        converterContractForMaths: '0x9a36b31ca768a860dab246cf080e7f042d1b7c0f',
        governanceContractAddress: '0x161f28A417361961E946Ae03EF0A425008b7F01B',
        etherscanUrl: 'https://ropsten.etherscan.io',
      };
  }
};

export const bntToken = (network: EthNetworks): string => {
  const vars = getNetworkVariables(network);
  return vars.bntToken;
};

const ropstenTokenEmptyProps = {
  logoURI: ropstenImage,
  chainId: 3,
  balance: null,
  decimals: 18,
  usdPrice: '0',
  liquidity: '0',
  usd_24h_ago: '0',
  price_change_24: 0,
  price_history_7d: [{ time: 1630000000 as UTCTimestamp, value: 0 }],
  usd_volume_24: '0',
  isWhitelisted: false,
};

//Used to test create pool
export const ropstenTokens: Token[] = [
  {
    address: '0x2080dD00237F1E2F3e95d501ae4a925496DBb200',
    name: 'Test4',
    symbol: 'TEST4',
    ...ropstenTokenEmptyProps,
  },
  {
    address: '0xf4e1355D07a953192c17010a46dfA1aaBB36BCf0',
    name: 'Test5',
    symbol: 'TEST5',
    ...ropstenTokenEmptyProps,
  },
  {
    address: '0xA79A95a1Cc1a586F8E1A069ff7D17AB6dB6acf3C',
    name: 'Test6',
    symbol: 'TEST6',
    ...ropstenTokenEmptyProps,
  },
  {
    address: '0x07d79EDBC43dFB94a6Db1dd99Bf06E7C06272687',
    name: 'PenTest Token',
    symbol: 'PENTEST',
    ...ropstenTokenEmptyProps,
  },
  {
    address: '0xb63303eAc901dBFaC854C531Ce4B281542F85364',
    name: 'DOZZ Token',
    symbol: 'DOZZ',
    ...ropstenTokenEmptyProps,
  },
];
