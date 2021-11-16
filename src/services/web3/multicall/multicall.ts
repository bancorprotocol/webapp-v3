import { web3 } from 'services/web3';
import { Multicall__factory } from 'services/web3/abis/types';
import { multiCallContract } from 'services/web3/config';
import { Interface } from '@ethersproject/abi';

export interface MultiCall {
  contractAddress: string;
  interface: Interface;
  methodName: string;
  methodParameters: any[];
}

export const multicall = async (calls: MultiCall[], blockHeight?: number) => {
  const multicallContract = Multicall__factory.connect(
    multiCallContract,
    web3.provider
  );

  try {
    const encoded = calls.map((call) => ({
      target: call.contractAddress.toLocaleLowerCase(),
      callData: call.interface.encodeFunctionData(
        call.methodName,
        call.methodParameters
      ),
    }));

    const encodedRes = await multicallContract.tryAggregate(false, encoded, {
      blockTag: blockHeight,
    });
    const res = encodedRes.map((call, i) => {
      if (!call.success) return [];

      return calls[i].interface.decodeFunctionResult(
        calls[i].methodName,
        call.returnData
      );
    });

    return res;
  } catch (error) {
    console.error(error);
  }
};
