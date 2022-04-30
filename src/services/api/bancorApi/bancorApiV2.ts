import axios from 'axios';
import { utils } from 'ethers';
import { WelcomeData } from 'services/api/bancorApi/bancorApi.types';

const axiosInstance = axios.create({
  baseURL: 'https://api-v2.bancor.network/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export abstract class BancorV2Api {
  static getWelcome = async (): Promise<WelcomeData> => {
    const { data } = await axiosInstance.get<WelcomeData>('welcome');

    return {
      ...data,
      pools: data.pools.map((pool) => ({
        ...pool,
        reserves: pool.reserves.map((reserve) => ({
          ...reserve,
          address: utils.getAddress(reserve.address),
        })),
        converter_dlt_id: utils.getAddress(pool.converter_dlt_id),
        pool_dlt_id: utils.getAddress(pool.pool_dlt_id),
      })),
      tokens: data.tokens.map((token) => ({
        ...token,
        dlt_id: utils.getAddress(token.dlt_id),
      })),
    };
  };
}
