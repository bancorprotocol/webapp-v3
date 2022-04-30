import axios from 'axios';
import {
  APIPoolV3,
  APIWelcomeV3,
} from 'services/api/bancorApi/bancorApi.types';

const axiosInstance = axios.create({
  baseURL: 'https://api-v3.bancor.network/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export abstract class BancorV3Api {
  static fetchWelcome = async (): Promise<APIWelcomeV3> => {
    const { data } = await axiosInstance.get<APIWelcomeV3>('/welcome');
    return data;
  };

  static fetchPools = async (): Promise<APIPoolV3[]> => {
    // TODO - add pools endpoint to backend
    const { pools } = await this.fetchWelcome();
    return pools;
  };

  static fetchStatistics = async (): Promise<any[]> => {
    // TODO - add statistics endpoint to backend
    return [];
  };
}
