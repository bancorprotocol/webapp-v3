import { ErrorCode } from 'services/web3/types';
import { wethToken } from 'services/web3/config';
import { writeWeb3 } from 'services/web3';

import {
  BaseNotification,
  NotificationType,
} from 'store/notification/notification';
import { expandToken } from 'utils/formulas';
import { Weth__factory } from '../abis/types';

export const depositWeth = async (amount: string) => {
  const tokenContract = Weth__factory.connect(wethToken, writeWeb3.signer);
  const wei = expandToken(amount, 18);

  const tx = await tokenContract.deposit({ value: wei });
  return tx.hash;
};

export const withdrawWeth = async (
  amount: string
): Promise<BaseNotification> => {
  const tokenContract = Weth__factory.connect(wethToken, writeWeb3.signer);
  const wei = expandToken(amount, 18);

  try {
    const tx = await tokenContract.withdraw(wei);

    return {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Withdraw WETH is pending confirmation',
      txHash: tx.hash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: `Your withdraw of ${amount} WETH has been confirmed`,
        errorTitle: 'Transaction Failed',
        errorMsg: `Withdrawing ${amount} WETH had failed. Please try again or contact support.`,
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
      title: 'Transaction Failed',
      msg: `Withdrawing ${amount} WETH had failed. Please try again or contact support.`,
    };
  }
};
