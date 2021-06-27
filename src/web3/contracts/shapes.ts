import { EthNetworks } from 'web3/types';
import { buildTokenContract } from 'web3/contracts/token/wrapper';
import { web3 } from 'web3/contracts/index';
import { DataTypes, MultiCall, ShapeWithLabel } from 'eth-multicall';
import { getNetworkVariables } from 'web3/config';

export const multi = async ({
  groupsOfShapes,
  blockHeight,
  traditional = false,
  currentNetwork,
}: {
  groupsOfShapes: ShapeWithLabel[][];
  blockHeight?: number;
  traditional?: boolean;
  currentNetwork: EthNetworks;
}) => {
  const networkVars = getNetworkVariables(currentNetwork);
  const multi = new MultiCall(
    web3,
    networkVars.multiCall,
    [500, 100, 50, 10, 1]
  );

  try {
    const res = await multi.all(groupsOfShapes, {
      traditional,
      blockHeight,
    });
    return res;
  } catch (e) {
    console.error(e);
  }
};

export const slimBalanceShape = (
  contractAddress: string,
  owner: string,
  network: EthNetworks
) => {
  const contract = buildTokenContract(contractAddress, web3);
  const template = {
    contract: DataTypes.originAddress,
    balance: contract.methods.balanceOf(owner),
  };
  return template;
};

export const balanceShape = (
  contractAddress: string,
  owner: string,
  network: EthNetworks
) => {
  const contract = buildTokenContract(contractAddress, web3);
  const template = {
    contract: DataTypes.originAddress,
    balance: contract.methods.balanceOf(owner),
    decimals: contract.methods.decimals(),
  };
  return template;
};
