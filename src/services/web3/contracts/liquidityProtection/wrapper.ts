import { CallReturn } from 'eth-multicall';
import Web3 from 'web3';
import { ContractMethods } from 'services/web3/types';
import { ContractSendMethod } from 'web3-eth-contract';
import { ABILiquidityProtection } from './abi';
import { buildContract, web3, writeWeb3 } from '..';
import { liquidityProtection$ } from 'services/observables/contracts';
import { first, take } from 'rxjs/operators';
import { expandToken, shrinkToken } from 'utils/formulas';
import { Pool, Token } from 'services/observables/tokens';
import { resolveTxOnConfirmation } from 'services/web3/index';
import { user$ } from 'services/observables/user';

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
  const liquidityProtectionContract = await liquidityProtection$
    .pipe(first())
    .toPromise();
  const contract = buildLiquidityProtectionContract(
    liquidityProtectionContract,
    web3
  );

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
