import { EthNetworks, RegisteredContracts } from 'services/web3/types';
import { CallReturn, MultiCall } from 'eth-multicall';
import { asciiToHex } from 'web3-utils';
import { ABIContractRegistry } from 'services/web3/contracts/addressLookup/abi';
import { buildContract, web3 } from 'services/web3/contracts';
import { toPairs } from 'lodash';
import { EthNetworkVariables } from 'services/web3/config';

export const buildAddressLookupContract = (contractAddress: string) =>
  buildContract<{
    addressOf: (ascii: string) => CallReturn<string>;
  }>(ABIContractRegistry, contractAddress);

export const fetchContractAddresses = async (
  networkVariables: EthNetworkVariables
): Promise<RegisteredContracts> => {
  const ethMulti =
    networkVariables.network === EthNetworks.Mainnet
      ? new MultiCall(web3)
      : new MultiCall(web3, networkVariables.multiCall, [500, 100, 50, 10, 1]);

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
      hardCodedShape(networkVariables.contractRegistry, label, ascii)
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
