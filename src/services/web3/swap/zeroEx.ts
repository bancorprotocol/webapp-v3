import { BancorApi } from 'services/api/bancorApi/bancorApi';
import { expandToken, shrinkToken } from 'utils/formulas';
import { writeWeb3 } from '../index';

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
  takerAddress: string,
  sellToken: string,
  buyToken: string,
  sellAmount: string
) => {
  const data = await BancorApi.ZeroEx.getQuote({
    sellToken,
    buyToken,
    sellAmount,
    takerAddress,
  });
  console.log(data);
  return await writeWeb3.signer.sendTransaction(data);
};
