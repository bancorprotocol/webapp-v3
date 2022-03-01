import { Token } from 'services/observables/tokens';
import BigNumber from 'bignumber.js';
import {
  mockedNonUniPositions,
  mockedUniPositions,
} from 'elements/earn/portfolio/v3/externalHoldings/mockedData';
import axios from 'axios';
import { prettifyNumber } from 'utils/helperFunctions';
import {
  ApyVisionData,
  ApyVisionNonUniPosition,
  ApyVisionNonUniResponse,
  ApyVisionUniPosition,
  ApyVisionUniResponse,
  ExternalHolding,
} from './externalHoldings.types';
import { utils } from 'ethers';

const fetchApyVisionUniswap = async (
  user: string
): Promise<ApyVisionUniPosition[]> => {
  const url = `https://stats.apy.vision/api/v1/uniswapv3/user_positions/${user}?accessToken=${process.env.REACT_APP_APY_VISION_TOKEN}`;
  try {
    const { data } = await axios.get<ApyVisionUniResponse>(url);
    return data.result;
  } catch (e: any) {
    console.error('Returning mocked data for APY Vision Uniswap');
    console.error(e.message);
    return mockedUniPositions;
  }
};

const fetchApyVisionNonUniswap = async (
  user: string
): Promise<ApyVisionNonUniPosition[]> => {
  const url = `https://api.apy.vision/portfolio/1/core/${user}?accessToken=${process.env.REACT_APP_APY_VISION_TOKEN}`;
  try {
    const { data } = await axios.get<ApyVisionNonUniResponse>(url);
    return data.userPools;
  } catch (e: any) {
    console.error('Returning mocked data for APY Vision NON Uniswap');
    console.error(e.message);
    return mockedNonUniPositions;
  }
};

export const fetchExternalHoldings = async (
  user: string
): Promise<ApyVisionData> => {
  const positionsUni = await fetchApyVisionUniswap(user);
  const positionsNonUni = await fetchApyVisionNonUniswap(user);
  return { positionsUni, positionsNonUni };
};

const REKT_STATUS_THRESHOLD = -50;
const getRektStatus = (usdValue: number, hodlValue: number): string => {
  const rektUsdValue = new BigNumber(usdValue).minus(hodlValue);
  const rektAtRisk = new BigNumber(rektUsdValue).lt(REKT_STATUS_THRESHOLD);
  return rektAtRisk ? prettifyNumber(rektUsdValue.times(-1), true) : 'At risk';
};

const getProviderName = (key: string) => {
  switch (key) {
    case 'balancerv2_eth':
      return 'Balancer V2';
    case 'oneinch_eth':
      return '1inch';
    case 'balancer_eth':
      return 'Balancer V2';
    case 'sushiswap_eth':
      return 'Sushiswap';
    case 'uniswap_eth':
      return 'Uniswap';
    case 'kyber_eth':
      return 'Kyber';
    case 'curve_eth':
      return 'Curve';
    default:
      return key;
  }
};

export const getExternalHoldingsUni = (
  positions: ApyVisionUniPosition[],
  tokensMap: Map<string, Token>
): ExternalHolding[] => {
  return positions
    .map((pos) => {
      const token0 = tokensMap.get(utils.getAddress(pos.token0_id));
      const token1 = tokensMap.get(utils.getAddress(pos.token1_id));
      if (!token0 && !token1) {
        return undefined;
      }
      const tokens = [token0, token1].filter((t) => !!t) as Token[];
      const usdValue = pos.current_day_data.position_usd_value_at_block;
      const rektStatus = getRektStatus(
        usdValue,
        pos.current_day_data.hodl_value
      );
      const ammName = 'Uniswap V3';
      return {
        ammName,
        tokens,
        rektStatus,
        usdValue,
      };
    })
    .filter((pos) => !!pos) as ExternalHolding[];
};

export const getExternalHoldingsNonUni = (
  positions: ApyVisionNonUniPosition[],
  tokensMap: Map<string, Token>
): ExternalHolding[] => {
  return positions
    .map((pos) => {
      const tokens = pos.tokens
        .map((token) => tokensMap.get(utils.getAddress(token.tokenAddress)))
        .filter((t) => !!t) as Token[];

      if (tokens.length === 0) {
        return undefined;
      }

      const usdValue = pos.totalValueUsd;
      const rektStatus = getRektStatus(usdValue, pos.initialCapitalValueUsd);
      const ammName = getProviderName(pos.poolProviderKey);
      const newPos: ExternalHolding = {
        ammName,
        tokens,
        rektStatus,
        usdValue,
      };
      return newPos;
    })
    .filter((pos) => !!pos) as ExternalHolding[];
};
