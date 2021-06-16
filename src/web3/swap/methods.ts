import { conversionPath, getRateByPath } from 'web3/contracts/network/wrapper';
import { web3 } from 'web3/contracts/index';
import { bancorNetwork$ } from 'observables/contracts';
import { firstValueFrom } from 'rxjs';

export const getRate = async (
  from: string,
  to: string,
  amount: string
): Promise<string> => {
  const networkContractAddress = await firstValueFrom(bancorNetwork$);

  const path = await conversionPath({
    from,
    to,
    networkContractAddress,
    web3,
  });
  return getRateByPath({ networkContractAddress, amount, path, web3 });
};
