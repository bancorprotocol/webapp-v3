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
    return pools;
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
