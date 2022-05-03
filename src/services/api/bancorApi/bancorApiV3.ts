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
        poolTokenDltId: '0x256Ed1d83E3e4EfDda977389A5389C3433137DDA',
        name: 'BNT',
        decimals: 18,
        tradingLiquidity: {
          bnt: '297030.818963170777040795',
          usd: '601487.408400',
          eur: '570893.234047',
          eth: '211.812677002637081107',
          tkn: '212.729912946654034629',
        },
        volume24h: {
          bnt: '27257.819292793700472352',
          usd: '56165.064951',
          eur: '53132.704279',
          eth: '19.975306574275626813',
          tkn: '20.120757468040490791',
        },
        fees24h: {
          bnt: '20.955947848021044470',
          usd: '43.225912',
          eur: '40.760995',
          eth: '0.015463204894002320',
          tkn: '20.980718782281364071',
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
