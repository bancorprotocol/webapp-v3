import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { expandToken, shrinkToken } from 'utils/formulas';
import { ContractsApi } from '../v3/contractsApi';
import { toBigNumber } from '../../../utils/helperFunctions';

type ZeroExRateParams = {
  value: string;
  from: {
    address: string;
    decimals: number;
  };
  to: {
    address: string;
    decimals: number;
  };
};

export const getZeroExRateAndPriceImpact = async ({
  from,
  to,
  value,
}: ZeroExRateParams) => {
  if (toBigNumber(value ?? '0').isZero()) {
    return { rate: '0', priceImpact: '0.0000', isV3: false };
  }
  try {
    const res = await BancorApi.ZeroEx.getPrice({
      sellToken: from.address,
      buyToken: to.address,
      sellAmount: expandToken(value, from.decimals),
    });
    console.log('api call to 0x price api: ', res);

    if (!res.estimatedPriceImpact) {
      throw new Error('estimatedPriceImpact is null');
    }

    return {
      rate: shrinkToken(res.buyAmount, to.decimals),
      priceImpact: res.estimatedPriceImpact,
      isV3: true,
    };
  } catch (e: any) {
    console.error('Failed fetching 0x rate and price impact: ', e);
    return { rate: '0', priceImpact: '0.0000', isV3: false };
  }
};

export const executeZeroExSwap = async (
  sellToken: string,
  buyToken: string,
  sellAmount: string
) => {
  const data = await BancorApi.ZeroEx.getQuote({
    sellToken,
    buyToken,
    sellAmount,
  });
  console.log(data);
  return await ContractsApi.ZeroEx.write.signer.sendTransaction({
    to: data.to,
    data: data.data,
    value: data.value,
    gasLimit: data.gasLimit,
    gasPrice: data.gasPrice,
  });
};
