import { NotificationType } from 'redux/notification/notification';
import { take } from 'rxjs/operators';
import { bancorConverterRegistry$ } from 'services/observables/contracts';
import { Token } from 'services/observables/tokens';
import { decToPpm } from 'utils/helperFunctions';
import { resolveTxOnConfirmation } from '..';
import { bntToken, zeroAddress } from '../config';
import { web3, writeWeb3 } from '../contracts';
import { buildConverterContract } from '../contracts/converter/wrapper';
import { buildRegistryContract } from '../contracts/converterRegistry/wrapper';
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
    const regContract = buildRegistryContract(
      converterRegistryAddress,
      writeWeb3
    );

    const reserves = [bntToken(network), token.address];
    const weights = ['500000', '500000'];

    const poolAddress = await regContract.methods
      .getLiquidityPoolByConfig(PoolType.Traditional, reserves, weights)
      .call();

    if (poolAddress !== zeroAddress)
      return {
        type: NotificationType.error,
        title: 'Pool Already exist',
        msg: `The pool already exists on Bancor`,
      };

    const txHash = await resolveTxOnConfirmation({
      tx: regContract.methods.newConverter(
        PoolType.Traditional,
        token.name,
        token.symbol,
        token.decimals,
        50000,
        reserves,
        weights
      ),
      resolveImmediately: true,
      user,
      onConfirmation: (hash) => onPoolCreated(hash, user, fee, dispatcher),
    });

    return {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Creating pool is pending confirmation',
      txHash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: 'Your pool was successfully created',
        errorTitle: 'Creating Pool Failed',
        errorMsg: 'Fail creating pool. Please try again or contact support.',
      },
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
  const converterAddress = await web3.eth.getTransactionReceipt(txHash);

  const converter = buildConverterContract(
    converterAddress.logs[0].address,
    writeWeb3
  );

  const ownerShip = await resolveTxOnConfirmation({
    tx: converter.methods.acceptOwnership(),
    user: user,
    resolveImmediately: true,
    onConfirmation: async () => {
      const conversionFee = await resolveTxOnConfirmation({
        tx: converter.methods.setConversionFee(decToPpm(fee)),
        user: user,
        resolveImmediately: true,
      });

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

  dispatcher({
    type: NotificationType.pending,
    title: 'Pending Confirmation',
    msg: 'Accepting ownership is pending confirmation',
    txHash: ownerShip,
    updatedInfo: {
      successTitle: 'Success!',
      successMsg: 'Ownership Accepted',
      errorTitle: 'Ownership Failed',
      errorMsg:
        'Failed accepting ownership. Please try again or contact support.',
    },
  });
};
