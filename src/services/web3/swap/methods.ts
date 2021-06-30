import { conversionPath, getRateByPath, getReturnByPath } from 'services/web3/contracts/network/wrapper';
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

export const getPriceImpact = async (
  fromToken: TokenListItem,
  toToken: TokenListItem,
  amount: string
) => {
  const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();
  const amountWei = expandToken(amount, fromToken.decimals)

  const path = await conversionPath({
    from: fromToken.address,
    to: toToken.address,
    networkContractAddress,
    web3,
  });

  const result = await getReturnByPath({
    networkContractAddress,
    amount: amountWei,
    path,
    web3,
  });

  const pathInverted = await conversionPath({
    from: toToken.address,
    to: fromToken.address,
    networkContractAddress,
    web3,
  });

  const resultInverted = await getReturnByPath({
    networkContractAddress,
    amount: result['0'],
    path: pathInverted,
    web3,
  });

  const output = Number(resultInverted['0']);
  const input = Number(amountWei);

  return ((1 - output / input) * 100) / 2;
};
