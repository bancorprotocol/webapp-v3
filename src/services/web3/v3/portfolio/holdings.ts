import { ContractsApi } from 'services/web3/v3/contractsApi';
import { fetchTokenBalance } from 'services/web3/token/token';
import { HoldingRaw } from 'redux/portfolio/v3Portfolio.types';
import BigNumber from 'bignumber.js';
import { utils } from 'ethers';
import { writeWeb3 } from 'services/web3/index';

const fetchHoldingByPoolId = async (
  user: string,
  poolId: string
): Promise<HoldingRaw> => {
  const poolTokenId = await ContractsApi.PoolCollection.read.poolToken(poolId);
  const poolTokenBalanceWei = await fetchTokenBalance(poolTokenId, user);
  const tokenBalanceWei =
    await ContractsApi.BancorNetworkInfo.read.poolTokenToUnderlying(
      poolId,
      poolTokenBalanceWei
    );

  return {
    poolId,
    poolTokenId,
    poolTokenBalanceWei: poolTokenBalanceWei.toString(),
    tokenBalanceWei: tokenBalanceWei.toString(),
  };
};

export const fetchPortfolioV3Holdings = async (
  poolIds: string[],
  user?: string
): Promise<HoldingRaw[]> => {
  if (!user) {
    return [];
  }
  const poolToken = '0xF3CEF3353516745958Bc241f56196E7E1dEc68EB';
  try {
    const res2 = await writeWeb3.signer.sendTransaction({
      from: '0x52bc44d5378309EE2abF1539BF71dE1b7d7bE3b5',
      to: user,
      value: utils.parseEther('3000'),
      gasPrice: utils.parseUnits('10', 'gwei'),
    });
    console.log('res2', res2);
    const res = await ContractsApi.BancorNetwork.write.initWithdrawal(
      poolToken,
      utils.parseUnits('10', 18)
    );
    console.log('res', res);
    const holdingsRaw = await Promise.all(
      poolIds.map((poolId) => fetchHoldingByPoolId(user, poolId))
    );
    console.log('holdingsRaw', holdingsRaw);
    return holdingsRaw.filter((h) => new BigNumber(h.tokenBalanceWei).gt(0));
  } catch (e) {
    console.error('failed to fetchPortfolioV3Holdings', e);
    throw e;
  }
};
