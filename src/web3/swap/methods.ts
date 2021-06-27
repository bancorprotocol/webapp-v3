import { conversionPath, getRateByPath } from 'web3/contracts/network/wrapper';
import { web3 } from 'web3/contracts';
import { contractAddresses$ } from 'observables/contracts';
import { take } from 'rxjs/operators';
import { TokenListItem } from 'observables/tokens';
import { expandToken, shrinkToken } from 'helpers';

export const getRate = async (
  fromToken: TokenListItem,
  toToken: TokenListItem,
  amount: string
): Promise<string> => {
  const networkContractAddress = (
    await contractAddresses$.pipe(take(1)).toPromise()
  ).BancorNetwork;

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
