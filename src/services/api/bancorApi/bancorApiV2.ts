import axios from 'axios';
import { utils } from 'ethers';
import { APIToken, WelcomeData } from 'services/api/bancorApi/bancorApi.types';
import { ethToken, wethToken } from 'services/web3/config';
import { getV2ApiUrlLS } from 'utils/localStorage';
const axiosInstance = axios.create({
  baseURL: getV2ApiUrlLS(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export abstract class BancorV2Api {
  static getWelcome = async (): Promise<WelcomeData> => {
    const { data } = await axiosInstance.get<WelcomeData>('welcome');
    const weth = data.tokens.find((t) => t.dlt_id === ethToken);
    const wethTkn: APIToken = {
      ...weth!,
      dlt_id: wethToken,
      symbol: 'WETH',
    };
    data.tokens.push(wethTkn);
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
