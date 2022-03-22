import { Token__factory } from 'services/web3/abis/types';
import { web3 } from 'services/web3/index';
import { BigNumber } from 'ethers';

export const fetchTokenSupply = async (
  tokenAddress: string,
  blockHeight?: number
) => {
  const contract = Token__factory.connect(tokenAddress, web3.provider);
  return contract.totalSupply({ blockTag: blockHeight });
};

export const fetchTokenBalance = async (
  tokenId: string,
  user: string
): Promise<BigNumber> => {
  const contract = Token__factory.connect(tokenId, web3.provider);
  return await contract.balanceOf(user);
};
