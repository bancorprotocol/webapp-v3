import axios from 'axios';
import {
  APIPoolV3,
  APIStatsV3,
  APITokenV3,
  APIWelcomeV3,
} from 'services/api/bancorApi/bancorApi.types';
import { ethToken } from 'services/web3/config';

const axiosInstance = axios.create({
  baseURL: 'https://api-v3.bancor.network/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export abstract class BancorV3Api {
  static getWelcome = async (): Promise<APIWelcomeV3> => {
    const { data } = await axiosInstance.get<APIWelcomeV3>('/welcome');
    return data;
  };

  static getPools = async (): Promise<APIPoolV3[]> => {
    // TODO - add pools endpoint to backend
    const { pools } = await this.getWelcome();
    return [
      ...pools,
      {
        poolDltId: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
        poolTokenDltId: '0xAB05Cf7C6c3a288cd36326e4f7b8600e7268E344',
        name: 'BNT',
        decimals: 18,
        tradingLiquidity: {
          bnt: '874714.922719076940267372',
          usd: '1759274.297463',
          eur: '1669402.307878',
          eth: '626.442651829626649662',
          tkn: '874714.922719076940267372',
        },
        volume24h: {
          bnt: '3489.866332177520673766',
          usd: '7066.979322',
          eur: '6707.523090',
          eth: '2.488623681475789992',
          tkn: '3523.073762562951308015',
        },
        fees24h: {
          bnt: '3.496860052282084843',
          usd: '7.081141',
          eur: '6.720965',
          eth: '0.002493610903282354',
          tkn: '3.499374188239432901',
        },
        fundingLimit: '',
        stakedBalance: '',
        tradingLiqBNT: '',
        tradingLiqTKN: '',
        tknVaultBalance: '',
        depositLimit: '',
        depositingEnabled: true,
        tradingEnabled: true,
      },
    ];
  };

  static getTokens = async (): Promise<APITokenV3[]> => {
    // const { data } = await axiosInstance.get<APITokenV3[]>('/tokens');
    return [
      {
        symbol: 'BNT',
        dltId: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
        rate: {
          bnt: '1',
          usd: '1',
          eur: '0.00',
          eth: '0.00',
          tkn: '0.00',
        },
        rate24hAgo: {
          bnt: '1',
          usd: '0.00',
          eur: '0.00',
          eth: '0.00',
          tkn: '0.00',
        },
        rateHistory7d: [],
      },
      {
        symbol: 'ETH',
        dltId: ethToken,
        rate: {
          bnt: '1',
          usd: '1',
          eur: '0.00',
          eth: '0.00',
          tkn: '0.00',
        },
        rate24hAgo: {
          bnt: '1',
          usd: '0.00',
          eur: '0.00',
          eth: '0.00',
          tkn: '0.00',
        },
        rateHistory7d: [],
      },
      {
        symbol: 'LINK',
        dltId: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
        rate: {
          bnt: '1',
          usd: '1',
          eur: '0.00',
          eth: '0.00',
          tkn: '0.00',
        },
        rate24hAgo: {
          bnt: '1',
          usd: '0.00',
          eur: '0.00',
          eth: '0.00',
          tkn: '0.00',
        },
        rateHistory7d: [],
      },
      {
        symbol: 'DAI',
        dltId: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        rate: {
          bnt: '1',
          usd: '1',
          eur: '0.00',
          eth: '0.00',
          tkn: '0.00',
        },
        rate24hAgo: {
          bnt: '1',
          usd: '0.00',
          eur: '0.00',
          eth: '0.00',
          tkn: '0.00',
        },
        rateHistory7d: [],
      },
    ];
  };

  static getStatistics = async (): Promise<APIStatsV3[]> => {
    const { data } = await axiosInstance.get<APIStatsV3[]>('/stats');
    return data;
  };
}
