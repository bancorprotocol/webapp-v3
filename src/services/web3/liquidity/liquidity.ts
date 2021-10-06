import { NotificationType } from 'redux/notification/notification';
import { take } from 'rxjs/operators';
import { bancorConverterRegistry$ } from 'services/observables/contracts';
import { Token } from 'services/observables/tokens';
import { decToPpm } from 'utils/helperFunctions';
import { resolveTxOnConfirmation } from '..';
import { bntToken, zeroAddress } from '../config';
import { web3 } from '../contracts';
import { buildConverterContract } from '../contracts/converter/wrapper';
import { buildRegistryContract } from '../contracts/converterRegistry/wrapper';
import { ErrorCode, EthNetworks, PoolType } from '../types';

export const createPool = async (
  token: Token,
  fee: string,
  network: EthNetworks,
  user: string
) => {
  try {
    const converterRegistryAddress = await bancorConverterRegistry$
      .pipe(take(1))
      .toPromise();
    const regContract = buildRegistryContract(converterRegistryAddress);

    const reserves = [bntToken(network), token.address];
    const weights = ['50', '50'];

    const poolAddress = await regContract.methods
      .getLiquidityPoolByConfig(PoolType.Traditional, reserves, weights)
      .call();

    if (poolAddress !== zeroAddress)
      return {
        type: NotificationType.error,
        title: 'Pool Already exist',
        msg: `Temp`,
      };

    const res = await resolveTxOnConfirmation({
      tx: regContract.methods.newConverter(
        PoolType.Traditional,
        token.name,
        token.symbol,
        token.decimals,
        50000,
        reserves,
        weights
      ),
      user,
    });

    const converterAddress = await web3.eth.getTransactionReceipt(res);

    const converter = buildConverterContract(converterAddress.logs[0].address);

    await resolveTxOnConfirmation({
      tx: converter.methods.acceptOwnership(),
      user: user,
    });
    await resolveTxOnConfirmation({
      tx: converter.methods.setConversionFee(decToPpm(fee)),
      user: user,
    });

    return {
      type: NotificationType.success,
      title: 'Success!',
      msg: 'Your pool was successfully created',
      txHash: res,
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
      msg: `Temp`,
    };
  }
};
