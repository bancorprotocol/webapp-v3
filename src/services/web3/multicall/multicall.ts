import { web3 } from 'services/web3';
import { Multicall__factory } from 'services/web3/abis/types';
import { getNetworkVariables } from 'services/web3/config';
import { EthNetworks } from 'services/web3/types';
import { Interface } from '@ethersproject/abi';

interface MultiCall {
  contractAddress: string;
  interface: Interface;
  methodName: string;
  methodParameters: any[];
}

export const multicall = async (network: EthNetworks, calls: MultiCall[]) => {
  const vars = getNetworkVariables(network);
  const multicallContract = Multicall__factory.connect(vars.multiCall, web3);

  const res = await multicallContract.aggregate(
    calls.map((call) => ({
      target: call.contractAddress,
      callData: call.interface.encodeFunctionData(
        call.methodName,
        call.methodParameters
      ),
    }))
  );

  return '';
};
