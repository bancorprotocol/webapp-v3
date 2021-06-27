import {
  conversionPath,
  getRateByPath,
} from 'services/web3/contracts/network/wrapper';
import { web3 } from 'services/web3/contracts';
import { bancorNetwork$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { TokenListItem } from 'services/observables/tokens';
import { expandToken, shrinkToken } from 'utils/pureFunctions';

export const getRate = async (
  fromToken: TokenListItem,
  toToken: TokenListItem,
  amount: string
): Promise<string> => {
  const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();

  const path = await conversionPath({
    from: fromToken.address,
    to: toToken.address,
    networkContractAddress,
    web3,
  });

  const fromAmountWei = expandToken(amount, fromToken.decimals);
  const toAmountWei = await getRateByPath({
    networkContractAddress,
    amount: fromAmountWei,
    path,
    web3,
  });

  return shrinkToken(toAmountWei, toToken.decimals);
};
