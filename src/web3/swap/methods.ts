import { conversionPath, getRateByPath } from 'web3/contracts/network/wrapper';
import { web3 } from 'web3/contracts/index';
import { contractAddresses$ } from 'observables/contracts';

export const getRate = async (
  from: string,
  to: string,
  amount: string
): Promise<string> => {
  const networkContractAddress = (await contractAddresses$.toPromise())
    .BancorNetwork;
  const path = await conversionPath({
    from,
    to,
    networkContractAddress,
    web3,
  });
  return getRateByPath({ networkContractAddress, amount, path, web3 });
};
