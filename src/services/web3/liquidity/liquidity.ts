import BigNumber from 'bignumber.js';
import { sortBy } from 'lodash';
import { NotificationType } from 'redux/notification/notification';
import { first, take } from 'rxjs/operators';
import {
  bancorConverterRegistry$,
  liquidityProtection$,
} from 'services/observables/contracts';
import { Pool, Token } from 'services/observables/tokens';
import { expandToken, shrinkToken } from 'utils/formulas';
import {
  calculateBntNeededToOpenSpace,
  calculatePriceDeviationTooHigh,
  decToPpm,
} from 'utils/helperFunctions';
import { web3, writeWeb3 } from '..';
import {
  ConverterRegistry__factory,
  Converter__factory,
  LiquidityProtection__factory,
} from '../abis/types';
import { bntToken, ethToken, zeroAddress } from '../config';
import { ErrorCode, EthNetworks, PoolType } from '../types';

export const createPool = async (
  token: Token,
  fee: string,
  network: EthNetworks,
  user: string,
  dispatcher: Function
) => {
  try {
    const converterRegistryAddress = await bancorConverterRegistry$
      .pipe(take(1))
      .toPromise();

    const regContract = ConverterRegistry__factory.connect(
      converterRegistryAddress,
      writeWeb3.signer
    );

    const reserves = [bntToken(network), token.address];
    const weights = ['500000', '500000'];

    const poolAddress = await regContract.getLiquidityPoolByConfig(
      PoolType.Traditional,
      reserves,
      weights
    );

    if (poolAddress !== zeroAddress)
      return {
        type: NotificationType.error,
        title: 'Pool Already exist',
        msg: `The pool already exists on Bancor`,
      };

    const tx = await regContract.newConverter(
      PoolType.Traditional,
      token.name,
      token.symbol,
      token.decimals,
      50000,
      reserves,
      weights
    );

    return {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Creating pool is pending confirmation',
      txHash: tx.hash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: 'Your pool was successfully created',
        errorTitle: 'Creating Pool Failed',
        errorMsg: 'Fail creating pool. Please try again or contact support.',
      },
      onCompleted: () => onPoolCreated(tx.hash, user, fee, dispatcher),
    };
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx)
      return {
        type: NotificationType.error,
        title: 'Transaction Rejected',
        msg: 'You rejected the transaction. If this was by mistake, please try again.',
      };

    return {
      type: NotificationType.error,
      title: 'Creating Pool Failed',
      msg: `Fail creating pool. Please try again or contact support.`,
    };
  }
};

const onPoolCreated = async (
  txHash: string,
  user: string,
  fee: string,
  dispatcher: Function
) => {
  const converterAddress = await web3.provider.getTransactionReceipt(txHash);

  const converter = Converter__factory.connect(
    converterAddress.logs[0].address,
    writeWeb3.signer
  );

  const ownerShip = await converter.acceptOwnership();

  dispatcher({
    type: NotificationType.pending,
    title: 'Pending Confirmation',
    msg: 'Accepting ownership is pending confirmation',
    txHash: ownerShip.hash,
    updatedInfo: {
      successTitle: 'Success!',
      successMsg: 'Ownership Accepted',
      errorTitle: 'Ownership Failed',
      errorMsg:
        'Failed accepting ownership. Please try again or contact support.',
    },
    onCompleted: async () => {
      const conversionFee = await converter.setConversionFee(decToPpm(fee));
      dispatcher({
        type: NotificationType.pending,
        title: 'Pending Confirmation',
        msg: 'Setting convertion fee is pending confirmation',
        txHash: conversionFee,
        updatedInfo: {
          successTitle: 'Success!',
          successMsg: 'Conversion fee has been set',
          errorTitle: 'Conversion fee failed',
          errorMsg:
            'conversion fee setting failed. Please try again or contact support.',
        },
      });
    },
  });
};

export const addLiquidity = async (
  data: { token: Token; amount: string }[],
  converterAddress: string
) => {
  const contract = Converter__factory.connect(
    converterAddress,
    writeWeb3.signer
  );
  const amountsWei = data.map((item) => ({
    address: item.token.address,
    weiAmount: expandToken(item.amount, item.token.decimals),
  }));

  const ethAmount = amountsWei.find((amount) => amount.address === ethToken);
  const value = ethAmount?.weiAmount;

  const tx = await contract.addLiquidity(
    amountsWei.map(({ address }) => address),
    amountsWei.map(({ weiAmount }) => weiAmount),
    '1',
    { value }
  );

  return tx.hash;
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

  const contract = LiquidityProtection__factory.connect(
    liquidityProtectionContract,
    writeWeb3.signer
  );
  const fromIsEth = ethToken === token.address;
  const tx = await contract.addLiquidity(
    pool.pool_dlt_id,
    token.address,
    expandToken(amount, token.decimals),
    { value: fromIsEth ? expandToken(amount, 18) : undefined }
  );

  return tx.hash;
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

export const getSpaceAvailable = async (id: string, tknDecimals: number) => {
  console.log('1');
  const liquidityProtectionContract = await liquidityProtection$
    .pipe(first())
    .toPromise();
  const contract = LiquidityProtection__factory.connect(
    liquidityProtectionContract,
    web3.provider
  );
  console.log('2');

  console.log('liquidityProtectionContract', liquidityProtectionContract);
  const result = await contract.poolAvailableSpace(id);

  return {
    bnt: shrinkToken(result['1'].toString(), 18),
    tkn: shrinkToken(result['0'].toString(), tknDecimals),
  };
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

export const fetchReserveBalances = async (pool: Pool) => {
  const converterContract = Converter__factory.connect(
    pool.converter_dlt_id,
    web3.provider
  );
  const tknBalance = await converterContract
    .getConnectorBalance(pool.reserves[0].address)
    .toString();

  const bntBalance = await converterContract
    .getConnectorBalance(pool.reserves[1].address)
    .toString();

  return { tknBalance, bntBalance };
};
