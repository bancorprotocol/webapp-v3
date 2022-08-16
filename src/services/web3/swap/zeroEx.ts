import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { expandToken, shrinkToken } from 'utils/formulas';
import { ContractsApi } from '../v3/contractsApi';

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
  const res = await BancorApi.ZeroEx.getPrice({
    sellToken: from.address,
    buyToken: to.address,
    sellAmount: expandToken(value + '00', from.decimals),
  });
  return {
    rate: shrinkToken(res.buyAmount, to.decimals),
    priceImpact: res.estimatedPriceImpact,
    isV3: true,
  };
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
