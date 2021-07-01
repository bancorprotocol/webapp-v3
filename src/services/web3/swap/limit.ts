import { wethToken } from 'services/web3/config';
import { expandToken } from 'utils/pureFunctions';
import { determineTxGas, resolveTxOnConfirmation } from 'services/web3/index';
import { buildWethContract } from '../contracts/eth/wrapper';
import BigNumber from 'bignumber.js';
import {
  getTxOrigin,
  Signature,
  RfqOrderJson,
  sendOrders,
} from 'services/api/keeperDao';
import dayjs from 'utils/dayjs';
import wait from 'waait';
import { web3 } from '../contracts';
import { TokenListItem } from 'services/observables/tokens';
import { RfqOrder, SignatureType } from '@0x/protocol-utils';
import { EthNetworks } from '../types';

export const depositWeth = async (
  decAmount: string,
  user: string,
  onPrompt: Function
) => {
  const tokenContract = buildWethContract(wethToken);
  const wei = expandToken(decAmount, 18);

  const res = await onPrompt();

  const tx = tokenContract.methods.deposit();
  const estimatedGas = await determineTxGas(tx, user);
  const manualBuffer = 2;

  const txHash = await resolveTxOnConfirmation({
    value: wei,
    tx,
    user,
    gas: estimatedGas * manualBuffer,
  });

  return txHash;
};

export const createOrder = async (
  fromToken: TokenListItem,
  toToken: TokenListItem,
  from: string,
  to: string,
  user: string,
  seconds: number,
  onPrompt: Function
): Promise<void> => {
  const now = dayjs().unix();
  const expiry = new BigNumber(now + seconds);

  const randomHex = web3.utils.randomHex(6);
  const randomNumber = web3.utils.hexToNumber(randomHex);
  const randomBigNumber = new BigNumber(randomNumber);
  const fromAmountWei = new BigNumber(expandToken(from, fromToken.decimals));
  const toAmountWei = new BigNumber(expandToken(to, toToken.decimals));
  const txOrigin = await getTxOrigin();

  const order = new RfqOrder({
    chainId: EthNetworks.Mainnet,
    expiry,
    salt: randomBigNumber,
    maker: user,
    makerToken: fromToken.address,
    makerAmount: fromAmountWei,
    takerAmount: toAmountWei,
    takerToken: toToken.address,
    txOrigin,
    pool: '0x000000000000000000000000000000000000000000000000000000000000002d',
  });

  //   await triggerApprovalIfRequired({
  //     owner: currentUser,
  //     amount: fromAmountWeiString,
  //     spender: order.verifyingContract,
  //     tokenAddress: from.id,
  //     onPrompt,
  //   });

  const signature = await order.getSignatureWithProviderAsync(
    // @ts-ignore
    web3.currentProvider,
    SignatureType.EIP712
  );

  const jsonOrder: RfqOrderJson = {
    maker: order.maker.toLowerCase(),
    taker: order.taker.toLowerCase(),
    chainId: order.chainId,
    expiry: order.expiry.toNumber(),
    makerAmount: order.makerAmount.toString().toLowerCase(),
    makerToken: order.makerToken.toLowerCase(),
    pool: order.pool.toLowerCase(),
    salt: order.salt.toString().toLowerCase(),
    signature,
    takerAmount: order.takerAmount.toString().toLowerCase(),
    takerToken: order.takerToken.toLowerCase(),
    txOrigin: order.txOrigin.toLowerCase(),
    verifyingContract: order.verifyingContract.toLowerCase(),
  };

  await sendOrders([jsonOrder]);
};
