import { expandToken } from 'utils/pureFunctions';
import { TokenListItem } from 'services/observables/tokens';
import { RfqOrder, SignatureType } from '@0x/protocol-utils';
import { getTxOrigin, RfqOrderJson, sendOrders } from 'services/api/keeperDao';
import { determineTxGas, resolveTxOnConfirmation } from 'services/web3/index';
import { buildWethContract } from 'services/web3/contracts/eth/wrapper';
import { EthNetworks } from 'services/web3/types';
import { wethToken } from 'services/web3/config';
import { web3 } from 'services/web3/contracts';
import BigNumber from 'bignumber.js';
import dayjs from 'utils/dayjs';

export const depositWeth = async (
  amount: string,
  user: string,
  onPrompt: Function
) => {
  const tokenContract = buildWethContract(wethToken);
  const wei = expandToken(amount, 18);

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

export const withdrawWeth = async (amount: string, user: string) => {
  const tokenContract = buildWethContract(wethToken);
  const wei = expandToken(amount, 18);

  const txHash = await resolveTxOnConfirmation({
    tx: tokenContract.methods.withdraw(wei),
    user,
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
