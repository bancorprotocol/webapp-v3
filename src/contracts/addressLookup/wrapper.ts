import { ContractMethods, RegisteredContracts } from 'types';
import { CallReturn, MultiCall } from 'eth-multicall';
import { asciiToHex, isAddress } from 'web3-utils';
import { ABIContractRegistry } from './abi';
import { buildContract, web3 } from 'contracts';
import { toPairs } from 'lodash';

export const buildAddressLookupContract = (
  contractAddress: string
): ContractMethods<{
  addressOf: (ascii: string) => CallReturn<string>;
}> => buildContract(ABIContractRegistry, contractAddress);

export const fetchContractAddresses = async (
  contractRegistry: string
): Promise<RegisteredContracts> => {
  if (!contractRegistry || !isAddress(contractRegistry))
    throw new Error('Must pass valid address');

  const ethMulti = new MultiCall(web3);

  const hardCodedBytes: RegisteredContracts = {
    BancorNetwork: asciiToHex('BancorNetwork'),
    BancorConverterRegistry: asciiToHex('BancorConverterRegistry'),
    LiquidityProtectionStore: asciiToHex('LiquidityProtectionStore'),
    LiquidityProtection: asciiToHex('LiquidityProtection'),
    StakingRewards: asciiToHex('StakingRewards'),
  };

  const hardCodedShape = (
    contractAddress: string,
    label: string,
    ascii: string
  ) => {
    const contract = buildAddressLookupContract(contractAddress);
    return {
      [label]: contract.methods.addressOf(ascii),
    };
  };

  const arrBytes = toPairs(hardCodedBytes) as [string, string][];

  try {
    const hardCodedShapes = arrBytes.map(([label, ascii]) =>
      hardCodedShape(contractRegistry, label, ascii)
    );
    const [contractAddresses] = await ethMulti.all([hardCodedShapes]);

    const registeredContracts = Object.assign(
      {},
      ...contractAddresses
    ) as RegisteredContracts;
    const allUndefined = toPairs(registeredContracts).some(
      ([key, data]) => data === undefined
    );
    if (allUndefined) throw new Error('All requests returned undefined');

    return registeredContracts;
  } catch (e) {
    throw new Error(e.message);
  }
};
