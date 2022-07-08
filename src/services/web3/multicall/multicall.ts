import { Interface } from '@ethersproject/abi';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { utils } from 'ethers';

export interface MultiCall {
  contractAddress: string;
  interface: Interface;
  methodName: string;
  methodParameters: any[];
}

export const multicall = async (calls: MultiCall[], blockHeight?: number) => {
  try {
    const encoded = calls.map((call) => ({
      target: call.contractAddress.toLocaleLowerCase(),
      callData: call.interface.encodeFunctionData(
        call.methodName,
        call.methodParameters
      ),
    }));
    const encodedRes = await ContractsApi.Multicall.read.tryAggregate(
      false,
      encoded,
      {
        blockTag: blockHeight,
      }
    );

    return encodedRes.map((call, i) => {
      if (!call.success) return [];

      return calls[i].interface.decodeFunctionResult(
        calls[i].methodName,
        call.returnData
      );
    });
  } catch (error) {
    console.error(error);
  }
};

export const fetchMulticall = async <T>(
  calls: MultiCall[],
  toUtf8String = false,
  blockHeight?: number
): Promise<T[]> => {
  try {
    const encoded = calls.map((call) => ({
      target: call.contractAddress,
      callData: call.interface.encodeFunctionData(
        call.methodName,
        call.methodParameters
      ),
    }));

    const encodedRes = await ContractsApi.Multicall.read.tryAggregate(
      false,
      encoded,
      {
        blockTag: blockHeight,
      }
    );

    return encodedRes.map((call, i) => {
      if (!call.success) {
        console.log(calls[i]);
        throw new Error('multicall failed');
      }
      if (toUtf8String) {
        return utils.toUtf8String(call.returnData).replace(/[^a-zA-Z0-9]/g, '');
      }
      const res = calls[i].interface.decodeFunctionResult(
        calls[i].methodName,
        call.returnData
      );
      return res[0];
    });
  } catch (error) {
    throw error;
  }
};
