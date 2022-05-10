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
    return data.data.map((token) => ({
      ...token,
      // TODO remove after Bancor API v3 is updated
      ...(token.symbol === 'BNT' && {
        rate: {
          bnt: '1',
          usd: '2',
          eur: '2',
          eth: '0.1',
          tkn: '1',
        },
      }),
      rateHistory7d: [],
    }));
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
