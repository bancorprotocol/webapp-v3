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

  static getPoolsWithBNT = async (): Promise<APIPoolV3[]> => {
    const [bnt, pools] = await Promise.all([this.getBnt(), this.getPools()]);
    const bntPool: APIPoolV3 = {
      poolDltId: bnt.poolDltId,
      poolTokenDltId: bnt.poolTokenDltId,
      name: bnt.name,
      decimals: bnt.decimals,
      tradingLiquidityTKN: {
        ...bnt.tradingLiquidity,
        tkn: bnt.tradingLiquidity.bnt,
      },
      tradingLiquidityBNT: {
        bnt: '0',
        usd: '0',
        eur: '0',
        eth: '0',
        tkn: '0',
      },
      volume24h: { ...bnt.volume24h, tkn: bnt.volume24h.bnt },
      fees24h: { ...bnt.fees24h, tkn: bnt.fees24h.bnt },
      stakedBalance: { ...bnt.stakedBalance, tkn: bnt.stakedBalance.bnt },
      standardRewardsClaimed24h: {
        ...bnt.standardRewardsClaimed24h,
        tkn: bnt.standardRewardsClaimed24h.bnt,
      },
      standardRewardsStaked: {
        ...bnt.standardRewardsStaked,
        tkn: bnt.standardRewardsStaked.bnt,
      },
      volume7d: bnt.volume7d,
      fees7d: bnt.fees7d,
      standardRewardsProviderJoined: {
        bnt: '0',
        usd: '0',
        eur: '0',
        eth: '0',
        tkn: '0',
      },
      standardRewardsProviderLeft: {
        bnt: '0',
        usd: '0',
        eur: '0',
        eth: '0',
        tkn: '0',
      },
      tradingEnabled: true,
    };
    return [bntPool, ...pools];
  };
}
