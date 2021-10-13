import { Token } from 'services/observables/tokens';
import { getTxOrigin, RfqOrderJson, sendOrders } from 'services/api/keeperDao';
import { NULL_ADDRESS, hexUtils } from '@0x/utils';
import { resolveTxOnConfirmation, web3 } from 'services/web3/index';
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
import { exchangeProxy$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';

export const depositWeth = async (amount: string, user: string) => {
  const tokenContract = Weth__factory.connect(wethToken, writeWeb3.provider);
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
  const tokenContract = Weth__factory.connect(wethToken, writeWeb3.provider);
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
  const exchangeProxyAddress = await exchangeProxy$.pipe(take(1)).toPromise();

  const signer = writeWeb3.provider.getSigner();
  const signature = await signer._signTypedData(
    domain(exchangeProxyAddress),
    types,
    {
      signer: signer,
      sender: user,
      minGasPrice: ZERO,
      maxGasPrice: ZERO,
      expirationTimeSeconds: expiry.toString(10),
      salt: ZERO,
      callData: hexUtils.leftPad(0),
      value: ZERO,
      feeToken: NULL_ADDRESS,
      feeAmount: ZERO,
    }
  );

  const jsonOrder: RfqOrderJson = {
    maker: user.toLowerCase(),
    taker: NULL_ADDRESS.toLocaleLowerCase(),
    chainId: EthNetworks.Mainnet,
    expiry: expiry.toNumber(),
    makerAmount: fromAmountWei.toString().toLowerCase(),
    makerToken: fromToken.address.toLowerCase(),
    pool: '0x000000000000000000000000000000000000000000000000000000000000002d',
    salt: utils.randomBytes(16).toString().toLowerCase(),
    signature,
    takerAmount: toAmountWei.toString().toLowerCase(),
    takerToken: toToken.address.toLowerCase(),
    txOrigin: txOrigin.toLowerCase(),
    verifyingContract: exchangeProxyAddress.toLowerCase(),
  };

  await sendOrders([jsonOrder]);
};
const ZERO = new BigNumber(0).toString(10);

const domain = (exchangeProxyAddress: string) => ({
  chainId: 1,
  verifyingContract: exchangeProxyAddress,
  name: 'ZeroEx',
  version: '1.0.0',
});

const types = {
  EIP712Domain: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' },
  ],
  MetaTransactionData: [
    { type: 'address', name: 'signer' },
    { type: 'address', name: 'sender' },
    { type: 'uint256', name: 'minGasPrice' },
    { type: 'uint256', name: 'maxGasPrice' },
    { type: 'uint256', name: 'expirationTimeSeconds' },
    { type: 'uint256', name: 'salt' },
    { type: 'bytes', name: 'callData' },
    { type: 'uint256', name: 'value' },
    { type: 'address', name: 'feeToken' },
    { type: 'uint256', name: 'feeAmount' },
  ],
};
