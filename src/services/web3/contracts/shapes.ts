import { EthNetworks } from 'services/web3/types';
import { buildTokenContract } from 'services/web3/contracts/token/wrapper';
import { web3 } from 'services/web3/contracts';
import { DataTypes, MultiCall, ShapeWithLabel } from 'eth-multicall';
import { getNetworkVariables } from 'services/web3/config';

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

export const balanceShape = (address: string, owner: string) => {
  const contract = buildTokenContract(address, web3);
  return {
    address: DataTypes.originAddress,
    balance: contract.methods.balanceOf(owner),
  };
};
