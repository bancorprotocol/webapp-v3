import { Token } from 'services/observables/tokens';
import { getTxOrigin, RfqOrderJson, sendOrders } from 'services/api/keeperDao';
import { resolveTxOnConfirmation } from 'services/web3/index';
import { ErrorCode, EthNetworks, SignatureType } from 'services/web3/types';
import { wethToken } from 'services/web3/config';
import { writeWeb3 } from 'services/web3';
import BigNumber from 'bignumber.js';
import dayjs from 'utils/dayjs';
import {
  BaseNotification,
  NotificationType,
} from 'redux/notification/notification';
import { expandToken } from 'utils/formulas';
import { Weth__factory } from '../abis/types';
import { utils } from 'ethers';

export const depositWeth = async (amount: string, user: string) => {
  const tokenContract = Weth__factory.connect(wethToken, writeWeb3);
  const wei = expandToken(amount, 18);

  const tx = await tokenContract.deposit();

  const txHash = await resolveTxOnConfirmation({
    value: wei,
    tx,
    user,
    resolveImmediately: true,
  });

  return txHash;
};

export const withdrawWeth = async (
  amount: string,
  user: string
): Promise<BaseNotification> => {
  const tokenContract = Weth__factory.connect(wethToken, writeWeb3);
  const wei = expandToken(amount, 18);

  try {
    const txHash = await resolveTxOnConfirmation({
      tx: await tokenContract.withdraw(wei),
      user,
      resolveImmediately: true,
    });
    return {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Withdraw WETH is pending confirmation',
      txHash,
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

export const createOrder = async (
  fromToken: Token,
  toToken: Token,
  from: string,
  to: string,
  user: string,
  seconds: number
): Promise<void> => {
  const now = dayjs().unix();
  const expiry = new BigNumber(now + seconds);

  const fromAmountWei = new BigNumber(expandToken(from, fromToken.decimals));
  const toAmountWei = new BigNumber(expandToken(to, toToken.decimals));
  const txOrigin = await getTxOrigin();

  // const order = new RfqOrder({
  //   chainId: EthNetworks.Mainnet,
  //   expiry,
  //   salt: utils.randomBytes(16),
  //   maker: user,
  //   makerToken: fromToken.address,
  //   makerAmount: fromAmountWei,
  //   takerAmount: toAmountWei,
  //   takerToken: toToken.address,
  //   txOrigin,
  //   pool: '0x000000000000000000000000000000000000000000000000000000000000002d',
  // });
  // const signer = await writeWeb3.getSigner();
  // //const signnn = await signer._signTypedData()

  // const signature = await order.getSignatureWithProviderAsync(
  //   writeWeb3,
  //   SignatureType.EIP712
  // );

  // const jsonOrder: RfqOrderJson = {
  //   maker: order.maker.toLowerCase(),
  //   taker: order.taker.toLowerCase(),
  //   chainId: order.chainId,
  //   expiry: order.expiry.toNumber(),
  //   makerAmount: order.makerAmount.toString().toLowerCase(),
  //   makerToken: order.makerToken.toLowerCase(),
  //   pool: order.pool.toLowerCase(),
  //   salt: order.salt.toString().toLowerCase(),
  //   signature,
  //   takerAmount: order.takerAmount.toString().toLowerCase(),
  //   takerToken: order.takerToken.toLowerCase(),
  //   txOrigin: order.txOrigin.toLowerCase(),
  //   verifyingContract: order.verifyingContract.toLowerCase(),
  // };

  await sendOrders([]);
};
