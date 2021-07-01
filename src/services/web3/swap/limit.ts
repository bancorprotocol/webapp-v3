import { wethToken } from 'services/web3/config';
import { expandToken } from 'utils/pureFunctions';
import { determineTxGas, resolveTxOnConfirmation } from 'services/web3/index';
import { buildWethContract } from '../contracts/eth/wrapper';

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
