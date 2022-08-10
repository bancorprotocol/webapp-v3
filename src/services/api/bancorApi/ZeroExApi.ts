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
};

export abstract class ZeroExApi {
  static getPrice = async (params: ZeroExApiQuoteInput): Promise<any> => {
    const { data } = await axiosInstance.get('/price', { params });
    return data;
  };

  static getQuote = async (params: ZeroExApiQuoteInput): Promise<any> => {
    const { data } = await axiosInstance.get('/quote', { params });
    return data;
  };
}
