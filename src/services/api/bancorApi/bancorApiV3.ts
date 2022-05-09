import axios from 'axios';
import {
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
    return [
      ...data.data,
      {
        poolDltId: '0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C',
        poolTokenDltId: '0xAB05Cf7C6c3a288cd36326e4f7b8600e7268E344',
        name: 'BNT',
        decimals: 18,
        tradingLiquidityTKN: {
          bnt: '874714.922719076940267372',
          usd: '1759274.297463',
          eur: '1669402.307878',
          eth: '626.442651829626649662',
          tkn: '874714.922719076940267372',
        },
        tradingLiquidityBNT: {
          bnt: '874714.922719076940267372',
          usd: '1759274.297463',
          eur: '1669402.307878',
          eth: '626.442651829626649662',
          tkn: '874714.922719076940267372',
        },
        volume24h: {
          bnt: '3489.866332177520673766',
          usd: '7066.979322',
          eur: '6707.523090',
          eth: '2.488623681475789992',
          tkn: '3523.073762562951308015',
        },
        fees24h: {
          bnt: '3.496860052282084843',
          usd: '7.081141',
          eur: '6.720965',
          eth: '0.002493610903282354',
          tkn: '3.499374188239432901',
        },
        stakedBalance: {
          bnt: '3.496860052282084843',
          usd: '7.081141',
          eur: '6.720965',
          eth: '0.002493610903282354',
          tkn: '3.499374188239432901',
        },
        tradingFeePPM: '20000',
        standardRewardsClaimed24h: {
          bnt: '3.496860052282084843',
          usd: '7.081141',
          eur: '6.720965',
          eth: '0.002493610903282354',
          tkn: '3.499374188239432901',
        },
        standardRewardsStaked: {
          bnt: '3.496860052282084843',
          usd: '7.081141',
          eur: '6.720965',
          eth: '0.002493610903282354',
          tkn: '3.499374188239432901',
        },
        autoCompoundingRewards24h: {
          bnt: '3.496860052282084843',
          usd: '7.081141',
          eur: '6.720965',
          eth: '0.002493610903282354',
          tkn: '3.499374188239432901',
        },
      },
    ];
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
}
