import { Token } from 'services/observables/tokens';
import {
  getOrderDetails,
  RfqOrderJson,
  sendOrders,
} from 'services/api/keeperDao';
import { NULL_ADDRESS } from '@0x/utils';
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

export const createOrder = async (
  fromToken: Token,
  toToken: Token,
  from: string,
  to: string,
  user: string,
  seconds: number
): Promise<void> => {
  const expiry = Number(dayjs().unix() + seconds);
  const fromAmountWei = new BigNumber(expandToken(from, fromToken.decimals));
  const toAmountWei = new BigNumber(expandToken(to, toToken.decimals));
  const salt = Number(utils.hexlify(utils.randomBytes(6)));
  const orderDetails = await getOrderDetails();

  const order = {
    maker: user.toLowerCase(),
    taker: NULL_ADDRESS.toLocaleLowerCase(),
    expiry,
    makerAmount: fromAmountWei.toString(),
    makerToken: fromToken.address.toLowerCase(),
    pool: orderDetails.pool,
    salt,
    takerAmount: toAmountWei.toString(),
    takerToken: toToken.address.toLowerCase(),
    txOrigin: orderDetails.txOrigin,
  };

  const signature = await writeWeb3.signer._signTypedData(
    domain(orderDetails.verifyingContract),
    types,
    order
  );

  const splittedSign = utils.splitSignature(signature);
  const jsonOrder: RfqOrderJson = {
    maker: order.maker.toLowerCase(),
    taker: order.taker,
    chainId: EthNetworks.Mainnet,
    expiry: order.expiry,
    makerAmount: order.makerAmount,
    makerToken: order.makerToken.toLowerCase(),
    pool: order.pool,
    salt: order.salt,
    signature: {
      r: splittedSign.r,
      s: splittedSign.s,
      v: splittedSign.v,
      signatureType: SignatureType.EIP712,
    },
    takerAmount: order.takerAmount,
    takerToken: order.takerToken.toLowerCase(),
    txOrigin: order.txOrigin.toLowerCase(),
    verifyingContract: orderDetails.verifyingContract.toLowerCase(),
  };

  await sendOrders([jsonOrder]);
};

const domain = (exchangeProxyAddress: string) => ({
  chainId: 1,
  verifyingContract: exchangeProxyAddress,
  name: 'ZeroEx',
  version: '1.0.0',
});

const types = {
  RfqOrder: [
    { type: 'address', name: 'makerToken' },
    { type: 'address', name: 'takerToken' },
    { type: 'uint128', name: 'makerAmount' },
    { type: 'uint128', name: 'takerAmount' },
    { type: 'address', name: 'maker' },
    { type: 'address', name: 'taker' },
    { type: 'address', name: 'txOrigin' },
    { type: 'bytes32', name: 'pool' },
    { type: 'uint64', name: 'expiry' },
    { type: 'uint256', name: 'salt' },
  ],
};
