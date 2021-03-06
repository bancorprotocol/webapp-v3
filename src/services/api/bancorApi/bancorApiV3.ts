import axios from 'axios';
import {
  APIBntV3,
  APIDataV3,
  APIPoolV3,
  APIStatsV3,
  APITokenV3,
} from 'services/api/bancorApi/bancorApi.types';
import { getV3ApiUrlLS } from 'utils/localStorage';

const axiosInstance = axios.create({
  baseURL: getV3ApiUrlLS(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export abstract class BancorV3Api {
  static getPools = async (): Promise<APIPoolV3[]> => {
    try {
      const { data } = await axiosInstance.get<APIDataV3<APIPoolV3[]>>(
        '/pools'
      );
      return data.data;
    } catch (error) {
      console.error(error);
    }

    return [];
  };

  static getTokens = async (): Promise<APITokenV3[]> => {
    try {
      const { data } = await axiosInstance.get<APIDataV3<APITokenV3[]>>(
        '/tokens'
      );
      return data.data.map((token) => ({
        ...token,
        // TODO remove after Bancor API v3 is updated
        rateHistory7d: [],
      }));
    } catch (error) {
      console.error(error);
    }

    return [];
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
