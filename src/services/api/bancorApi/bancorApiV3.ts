import axios from 'axios';
import {
  APIBntV3,
  APIDataV3,
  APIPoolV3,
  APIStatsV3,
  APITokenV3,
} from 'services/api/bancorApi/bancorApi.types';

const axiosInstance = axios.create({
  baseURL: 'https://api-v3.bancor.network/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export abstract class BancorV3Api {
  static getPools = async (): Promise<APIPoolV3[]> => {
    const { data } = await axiosInstance.get<APIDataV3<APIPoolV3[]>>('/pools');
    return data.data;
  };

  static getTokens = async (): Promise<APITokenV3[]> => {
    const { data } = await axiosInstance.get<APIDataV3<APITokenV3[]>>(
      '/tokens'
    );
    const mockedTokens = data.data.map((token) => ({
      ...token,
      rateHistory7d: [],
    }));
    return [
      ...mockedTokens,
      {
        symbol: 'BNT',
        dltId: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
        rate: {
          bnt: '1',
          usd: '1',
          eur: '0.00',
          eth: '0.00',
          tkn: '1',
        },
        rate24hAgo: {
          bnt: '1',
          usd: '0.00',
          eur: '0.00',
          eth: '0.00',
          tkn: '1',
        },
        rateHistory7d: [],
      },
    ];
  };

  static getStatistics = async (): Promise<APIStatsV3> => {
    const { data } = await axiosInstance.get<APIDataV3<APIStatsV3>>('/stats');
    return data.data;
  };

  static getBnt = async (): Promise<APIBntV3> => {
    const { data } = await axiosInstance.get<APIDataV3<APIBntV3>>('/bnt');
    return data.data;
  };
}
