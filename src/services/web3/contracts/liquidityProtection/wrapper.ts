import { CallReturn } from 'eth-multicall';
import Web3 from 'web3';
import { ContractMethods } from 'services/web3/types';
import { ContractSendMethod } from 'web3-eth-contract';
import {
  ABILiquidityProtection,
  ABILiquidityProtectionSystemStore,
} from './abi';
import { buildContract, web3, writeWeb3 } from '..';
import { liquidityProtection$ } from 'services/observables/contracts';
import { first, take } from 'rxjs/operators';
import { expandToken, shrinkToken } from 'utils/formulas';
import { Pool, Token } from 'services/observables/tokens';
import { resolveTxOnConfirmation } from 'services/web3/index';
import { user$ } from 'services/observables/user';
import BigNumber from 'bignumber.js';
import {
  buildConverterContract,
  buildV28ConverterContract,
} from 'services/web3/contracts/converter/wrapper';
import { buildLiquidityProtectionSettingsContract } from 'services/web3/contracts/swap/wrapper';
import {
  calculateBntNeededToOpenSpace,
  calculatePriceDeviationTooHigh,
} from 'utils/helperFunctions';
import { sortBy } from 'lodash';

export const buildLiquidityProtectionContract = (
  contractAddress: string,
  web3?: Web3
): ContractMethods<{
  store: () => CallReturn<string>;
  systemStore: () => CallReturn<string>;
  govToken: () => CallReturn<string>;
  isPoolSupported: (anchor: string) => CallReturn<boolean>;
  protectLiquidity: (
    anchor: string,
    poolTokenWei: string
  ) => ContractSendMethod;
  unprotectLiquidity: (dbId1: string, dbId2: string) => ContractSendMethod;
  addLiquidity: (
    anchor: string,
    reserveAddress: string,
    reserveAmountWei: string
  ) => ContractSendMethod;
  removeLiquidity: (dbId: string, ppmPercent: string) => ContractSendMethod;
  claimBalance: (startIndex: string, endIndex: string) => ContractSendMethod;
  transferLiquidity: (id: string, newProvider: string) => ContractSendMethod;
  removeLiquidityReturn: (
    id: string,
    portion: string,
    removeTimeStamp: string
  ) => CallReturn<{ '0': string; '1': string; '2': string }>;
  poolROI: (
    poolToken: string,
    reserveToken: string,
    reserveAmount: string,
    poolRateN: string,
    poolRateD: string,
    reserveRateN: string,
    reserveRateD: string
  ) => CallReturn<string>;
  settings: () => CallReturn<string>;
  poolAvailableSpace: (
    poolAnchor: string
  ) => CallReturn<{ '0': string; '1': string }>;
}> => buildContract(ABILiquidityProtection, contractAddress, web3);

export const buildLiquidityProtectionSystemStoreContract = (
  contractAddress: string,
  web3?: Web3
): ContractMethods<{
  networkTokensMinted: (poolId: string) => CallReturn<string>;
}> => buildContract(ABILiquidityProtectionSystemStore, contractAddress, web3);

export const fetchLiquidityProtectionSettingsContract = async (
  liquidityProtectionContract: string
): Promise<string> => {
  const contract = buildLiquidityProtectionContract(
    liquidityProtectionContract,
    web3
  );
  return contract.methods.settings().call();
};

export const getSpaceAvailable = async (id: string, tknDecimals: number) => {
  console.log('1');
  const liquidityProtectionContract = await liquidityProtection$
    .pipe(first())
    .toPromise();
  const contract = buildLiquidityProtectionContract(
    liquidityProtectionContract,
    web3
  );
  console.log('2');

  console.log('liquidityProtectionContract', liquidityProtectionContract);
  const result = await contract.methods.poolAvailableSpace(id).call();

  return {
    bnt: shrinkToken(result['1'], 18),
    tkn: shrinkToken(result['0'], tknDecimals),
  };
};

interface AddLiquidityProps {
  pool: Pool;
  token: Token;
  amount: string;
}

export const addLiquiditySingle = async ({
  pool,
  token,
  amount,
}: AddLiquidityProps) => {
  const liquidityProtectionContract = await liquidityProtection$
    .pipe(first())
    .toPromise();

  const contract = buildLiquidityProtectionContract(
    liquidityProtectionContract,
    writeWeb3
  );
  const USER = await user$.pipe(take(1)).toPromise();

  return resolveTxOnConfirmation({
    tx: contract.methods.addLiquidity(
      pool.pool_dlt_id,
      token.address,
      expandToken(amount, token.decimals)
    ),
    user: USER,
    resolveImmediately: true,
  });
};

export const fetchReserveBalances = async (pool: Pool) => {
  const converterContract = buildConverterContract(pool.converter_dlt_id, web3);

  const tknBalance = await converterContract.methods
    .getConnectorBalance(pool.reserves[0].address)
    .call();
  const bntBalance = await converterContract.methods
    .getConnectorBalance(pool.reserves[1].address)
    .call();

  return { tknBalance, bntBalance };
};

export const fetchBntNeededToOpenSpace = async (
  pool: Pool
): Promise<string> => {
  const liquidityProtection_dlt_id = await liquidityProtection$
    .pipe(first())
    .toPromise();
  const liquidityProtectionSettings_dlt_id =
    await fetchLiquidityProtectionSettingsContract(liquidityProtection_dlt_id);
  const liquidityProtectionSettingsContract =
    await buildLiquidityProtectionSettingsContract(
      liquidityProtectionSettings_dlt_id
    );

  const liquidityProtectionContract = buildLiquidityProtectionContract(
    liquidityProtection_dlt_id,
    web3
  );

  const systemStore_dlt_id = await liquidityProtectionContract.methods
    .systemStore()
    .call();

  const liquidityProtectionSystemStoreContract =
    buildLiquidityProtectionSystemStoreContract(systemStore_dlt_id, web3);

  const networkTokenMintingLimits =
    await liquidityProtectionSettingsContract.methods
      .networkTokenMintingLimits(pool.pool_dlt_id)
      .call();

  const networkTokensMinted =
    await liquidityProtectionSystemStoreContract.methods
      .networkTokensMinted(pool.pool_dlt_id)
      .call();

  const { tknBalance, bntBalance } = await fetchReserveBalances(pool);

  const bntNeeded = calculateBntNeededToOpenSpace(
    bntBalance,
    tknBalance,
    networkTokensMinted,
    networkTokenMintingLimits
  );

  return shrinkToken(bntNeeded, 18);
};

export const checkPriceDeviationTooHigh = async (
  pool: Pool,
  selectedTkn: Token
): Promise<boolean> => {
  const converterContract = buildV28ConverterContract(
    pool.converter_dlt_id,
    web3
  );
  const liquidityProtection_dlt_id = await liquidityProtection$
    .pipe(first())
    .toPromise();
  const liquidityProtectionSettings_dlt_id =
    await fetchLiquidityProtectionSettingsContract(liquidityProtection_dlt_id);
  const liquidityProtectionSettingsContract =
    await buildLiquidityProtectionSettingsContract(
      liquidityProtectionSettings_dlt_id
    );

  const [primaryReserveAddress, secondaryReserveAddress] = sortBy(
    pool.reserves,
    [(o) => o.address !== selectedTkn.address]
  ).map((x) => x.address);

  const [
    recentAverageRate,
    averageRateMaxDeviation,
    primaryReserveBalance,
    secondaryReserveBalance,
  ] = await Promise.all([
    converterContract.methods.recentAverageRate(selectedTkn.address).call(),
    liquidityProtectionSettingsContract.methods
      .averageRateMaxDeviation()
      .call(),
    converterContract.methods.reserveBalance(primaryReserveAddress).call(),
    converterContract.methods.reserveBalance(secondaryReserveAddress).call(),
  ]);

  const averageRate = new BigNumber(recentAverageRate['1']).dividedBy(
    recentAverageRate['0']
  );

  if (averageRate.isNaN()) {
    throw new Error(
      'Price deviation calculation failed. Please contact support.'
    );
  }

  return calculatePriceDeviationTooHigh(
    averageRate,
    new BigNumber(primaryReserveBalance),
    new BigNumber(secondaryReserveBalance),
    new BigNumber(averageRateMaxDeviation)
  );
};
