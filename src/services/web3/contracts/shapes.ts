import { EthNetworks } from 'services/web3/types';
import { buildTokenContract } from 'services/web3/contracts/token/wrapper';
import { web3 } from 'services/web3/contracts';
import {
  CallReturn,
  DataTypes,
  MultiCall,
  ShapeWithLabel,
} from 'eth-multicall';
import { getNetworkVariables } from 'services/web3/config';
import { buildNetworkContract } from './network/wrapper';
import Web3 from 'web3';
import { buildConverterContract } from './converter/wrapper';

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

export const slimBalanceShape = (contractAddress: string, owner: string) => {
  const contract = buildTokenContract(contractAddress, web3);
  const template = {
    contract: DataTypes.originAddress,
    balance: contract.methods.balanceOf(owner),
  };
  return template;
};

export const balanceShape = (contractAddress: string, owner: string) => {
  const contract = buildTokenContract(contractAddress, web3);
  const template = {
    contract: DataTypes.originAddress,
    balance: contract.methods.balanceOf(owner),
    decimals: contract.methods.decimals(),
  };
  return template;
};

export const buildRateShape = async ({
  networkContractAddress,
  path,
  amount,
  web3,
}: {
  networkContractAddress: string;
  path: string[];
  amount: string;
  web3: Web3;
}): Promise<{
  contract: DataTypes;
  rate: CallReturn<string>;
}> => {
  const contract = buildNetworkContract(networkContractAddress, web3);
  return {
    contract: DataTypes.originAddress,
    rate: contract.methods.rateByPath(path, amount),
  };
};

export const buildPoolBalancesShape = async ({
  converterAddress,
  web3,
}: {
  converterAddress: string;
  web3: Web3;
}): Promise<{
  contract: DataTypes;
  balances: CallReturn<any>;
}> => {
  const contract = buildConverterContract(converterAddress, web3);
  return {
    contract: DataTypes.originAddress,
    balances: contract.methods.reserveBalances(),
  };
};
