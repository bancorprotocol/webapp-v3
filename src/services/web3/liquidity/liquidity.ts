import { NotificationType } from 'redux/notification/notification';
import { take } from 'rxjs/operators';
import { bancorConverterRegistry$ } from 'services/observables/contracts';
import { Token } from 'services/observables/tokens';
import { resolveTxOnConfirmation } from '..';
import { bntToken } from '../config';
import { buildRegistryContract } from '../contracts/converterRegistry/wrapper';
import { ErrorCode, EthNetworks, PoolType } from '../types';

export const createPool = async (
  token: Token,
  network: EthNetworks,
  user: string
) => {
  try {
    const converterRegistryAddress = await bancorConverterRegistry$
      .pipe(take(1))
      .toPromise();
    const contract = buildRegistryContract(converterRegistryAddress);

    const res = await resolveTxOnConfirmation({
      tx: contract.methods.newConverter(
        PoolType.Traditional,
        token.name,
        token.symbol,
        token.decimals,
        50000,
        [bntToken(network), token.address],
        ['50', '50']
      ),
      user,
      resolveImmediately: true,
    });

    //TODO claim ownership and set fee with returned converter address

    return {
      type: NotificationType.success,
      title: 'Success!',
      msg: 'Your pool was successfully created',
      txHash: '',
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
