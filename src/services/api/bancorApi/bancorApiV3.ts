import axios from 'axios';
import {
  APIPoolV3,
  APIStatsV3,
  APITokenV3,
  APIWelcomeV3,
} from 'services/api/bancorApi/bancorApi.types';

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
      },
    ];
  };

  static getTokens = async (): Promise<APITokenV3[]> => {
    const { data } = await axiosInstance.get<APITokenV3[]>('/tokens');
    return data;
  };

  static getStatistics = async (): Promise<APIStatsV3[]> => {
    const { data } = await axiosInstance.get<APIStatsV3[]>('/stats');
    return data;
  };
}
