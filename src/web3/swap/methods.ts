import { conversionPath, getRateByPath } from 'web3/contracts/network/wrapper';
import { web3 } from 'web3/contracts/index';
import { contractAddresses$ } from 'observables/contracts';
import { take } from 'rxjs/operators';

export const getRate = async (
  from: string,
  to: string,
  amount: string
): Promise<string> => {
  const networkContractAddress = (
    await contractAddresses$.pipe(take(1)).toPromise()
  ).BancorNetwork;

  const path = await conversionPath({
    from,
    to,
    networkContractAddress,
    web3,
  });
  return getRateByPath({ networkContractAddress, amount, path, web3 });
};
