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

  try {
    const encoded = calls.map((call) => ({
      target: call.contractAddress.toLocaleLowerCase(),
      callData: call.interface.encodeFunctionData(
        call.methodName,
        call.methodParameters
      ),
    }));

    const encodedRes = await multicallContract.aggregate(encoded);
    const res = encodedRes.returnData.map((call, i) => {
      return calls[i].interface.decodeFunctionResult(calls[i].methodName, call);
    });

    return res;
  } catch (error) {
    console.error('error', error);
  }
};
