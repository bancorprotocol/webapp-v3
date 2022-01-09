import BigNumber from 'bignumber.js';
import numeral from 'numeral';
import { EthNetworks } from 'services/web3/types';
import dayjs from 'dayjs';
import { shrinkToken } from './formulas';
import { APIPool } from '../services/api/bancor';
import { Pool } from '../services/observables/tokens';

const oneMillion = new BigNumber(1000000);

export const ppmToDec = (ppm: number | string | BigNumber) =>
  new BigNumber(ppm).div(oneMillion);

export const decToPpm = (dec: number | string | BigNumber): string =>
  new BigNumber(dec).times(oneMillion).toFixed(0);

export const prettifyNumber = (
  num: number | string | BigNumber,
  usd = false
): string => {
  const bigNum = new BigNumber(num);
  if (usd) {
    if (bigNum.lte(0)) return '$0.00';
    else if (bigNum.lt(0.01)) return '< $0.01';
    else if (bigNum.gt(100)) return numeral(bigNum).format('$0,0', Math.floor);
    else return numeral(bigNum).format('$0,0.00', Math.floor);
  } else {
    if (bigNum.lte(0)) return '0';
    else if (bigNum.gte(1000)) return numeral(bigNum).format('0,0', Math.floor);
    else if (bigNum.gte(2))
      return numeral(bigNum).format('0,0.[00]', Math.floor);
    else if (bigNum.lt(0.000001)) return '< 0.000001';
    else return numeral(bigNum).format('0.[000000]', Math.floor);
  }
};

export const formatDuration = (duration: plugin.Duration): string => {
  let sentence = '';
  const days = duration.days();
  const minutes = duration.minutes();
  const hours = duration.hours();
  if (days > 0) sentence += days + ' Days';
  if (hours > 0) sentence += ' ' + hours + ' Hours';
  if (minutes > 0) sentence += ' ' + minutes + ' Minutes';
  return sentence;
};

export const formatTime = (ms: number): string => {
  const countdown = dayjs.duration(ms).format('HH mm ss');
  let [hours, minutes, seconds] = countdown.split(' ').map((x) => parseInt(x));
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (!days && !hours && !minutes) {
    return `${seconds}s`;
  } else if (!days && !hours) {
    return `${minutes}m ${seconds}s`;
  } else if (!days) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
};

export const getNetworkName = (network: EthNetworks): string => {
  switch (network) {
    case EthNetworks.Mainnet:
      return 'Ethereum Mainnet';
    case EthNetworks.Ropsten:
      return 'Ropsten Test Network';
    default:
      return 'Unsupported network';
  }
};

export const isUnsupportedNetwork = (
  network: EthNetworks | undefined
): boolean => {
  return network !== undefined && EthNetworks[network] === undefined;
};

export const calculateBntNeededToOpenSpace = (
  bntBalance: string,
  tknBalance: string,
  networkTokensMinted: string,
  networkTokenMintingLimits: string
): string => {
  return new BigNumber(bntBalance)
    .div(tknBalance)
    .plus(networkTokensMinted)
    .minus(networkTokenMintingLimits)
    .toString();
};

export const calculatePriceDeviationTooHigh = (
  averageRate: BigNumber,
  primaryReserveBalance: BigNumber,
  secondaryReserveBalance: BigNumber,
  averageRateMaxDeviation: BigNumber
): boolean => {
  const spotRate = primaryReserveBalance.dividedBy(secondaryReserveBalance);

  const averageRateMaxDeviationBase = new BigNumber(oneMillion).minus(
    averageRateMaxDeviation
  );

  const threshold = averageRate.dividedBy(spotRate);

  const withinLowerThreshold = threshold.isGreaterThan(
    averageRateMaxDeviationBase.dividedBy(oneMillion)
  );

  const withinHigherThreshold = oneMillion
    .dividedBy(averageRateMaxDeviationBase)
    .isGreaterThan(threshold);

  return !(withinLowerThreshold && withinHigherThreshold);
};

export const rewindBlocksByDays = (
  currentBlock: number,
  days: number,
  secondsPerBlock = 13.3
) => {
  if (!Number.isInteger(currentBlock))
    throw new Error('Current block should be an integer');
  const secondsToRewind = dayjs.duration(days, 'days').asSeconds();
  const blocksToRewind = parseInt(String(secondsToRewind / secondsPerBlock));
  return currentBlock - blocksToRewind;
};

export const calculateProgressLevel = (
  startTimeSeconds: number,
  endTimeSeconds: number
) => {
  if (endTimeSeconds < startTimeSeconds)
    throw new Error('End time should be greater than start time');
  const totalWaitingTime = endTimeSeconds - startTimeSeconds;
  const now = dayjs().unix();
  if (now >= endTimeSeconds) return 1;
  const timeWaited = now - startTimeSeconds;
  return timeWaited / totalWaitingTime;
};

export const calculateAPR = (
  roi: number | string | BigNumber,
  magnitude: number | string | BigNumber
) => ppmToDec(roi).minus(1).times(magnitude);

export const calcUsdPrice = (
  amount: number | string | BigNumber,
  price: string | number | BigNumber | null,
  decimals: number
) => new BigNumber(shrinkToken(amount, decimals)).times(price ?? 0).toString();

export const IS_IN_IFRAME = window.self !== window.top;

export const findPoolByConverter = (
  converter: string,
  pools: Pool[],
  apiPools: APIPool[]
): APIPool | Pool | undefined => {
  const poolExists = pools.find((x) => x.converter_dlt_id === converter);

  if (poolExists) {
    return poolExists;
  } else {
    return apiPools.find((x) => x.converter_dlt_id === converter);
  }
};
