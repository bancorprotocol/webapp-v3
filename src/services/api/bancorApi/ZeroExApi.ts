import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://api.0x.org/swap/v1/',
  headers: {
    'Content-Type': 'application/json',
  },
});

type ZeroExApiQuoteInput = {
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  takerAddress?: string;
};

// Disable fees until further notice
const zeroExAffiliateOptions = {
  // feeRecipient: zeroExFeeRecipient,
  // buyTokenPercentageFee: 0.005,
};

export abstract class ZeroExApi {
  static getPrice = async (
    params: ZeroExApiQuoteInput,
    includeAffiliate = true
  ): Promise<any> => {
    const { data } = await axiosInstance.get('/price', {
      params: {
        ...params,
        ...(includeAffiliate && zeroExAffiliateOptions),
      },
    });
    return data;
  };

  static getQuote = async (params: ZeroExApiQuoteInput): Promise<any> => {
    const { data } = await axiosInstance.get('/quote', {
      params: {
        ...params,
        ...zeroExAffiliateOptions,
      },
    });
    return data;
  };
}
