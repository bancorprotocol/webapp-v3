import {
  conversionPath,
  getRateByPath,
  getReturnByPath,
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

export const getPriceImpact = async (
  fromToken: TokenListItem,
  toToken: TokenListItem,
  amount: string
) => {
  const networkContractAddress = await bancorNetwork$.pipe(take(1)).toPromise();

  console.log('--- INPUT ---');
  console.log('fromToken: ', fromToken.address);
  console.log('toToken: ', toToken.address);
  console.log('inputAmountWei: ', expandToken(amount, fromToken.decimals));
  console.log('--- INPUT END ---');

  const path = await conversionPath({
    from: fromToken.address,
    to: toToken.address,
    networkContractAddress,
    web3,
  });

  console.log('--- CONVERSION PATH ---');
  console.log(path);
  console.log('--- CONVERSION PATH END ---');

  const result = await getReturnByPath({
    networkContractAddress,
    amount: expandToken(amount, fromToken.decimals),
    path,
    web3,
  });

  console.log('--- GETRETURNPATH METHOD ---');
  console.log('outputAmountWei: ', result['0']);
  console.log('--- GETRETURNPATH METHOD END ---');

  const pathInverted = await conversionPath({
    from: toToken.address,
    to: fromToken.address,
    networkContractAddress,
    web3,
  });

  console.log('--- INVERTED CONVERSION PATH ---');
  console.log(pathInverted);
  console.log('--- INVERTED CONVERSION PATH END ---');

  const resultInverted = await getReturnByPath({
    networkContractAddress,
    amount: result['0'],
    path: pathInverted,
    web3,
  });

  console.log('--- INVERTED GETRETURNPATH METHOD ---');
  console.log('invertedOutputAmountWei: ', resultInverted['0']);
  console.log('--- INVERTED GETRETURNPATH METHOD END ---');

  const output = Number(resultInverted['0']);
  const input = Number(expandToken(amount, fromToken.decimals));

  const priceImpact = ((1 - output / input) * 100) / 2;
  console.log('--- RESULT PRICE IMPACT ---');
  console.log('priceImpact: ', priceImpact);
  console.log('--- RESULT PRICE IMPACT END ---');

  return priceImpact;
};
