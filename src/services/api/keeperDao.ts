import axios from 'axios';
import BigNumber from 'bignumber.js';
import JSONbig from 'json-bigint';
import { take } from 'rxjs/operators';
import { tokenList$, TokenListItem } from 'services/observables/tokens';
import { ethToken, wethToken } from 'services/web3/config';
import { createOrder, depositWeth } from 'services/web3/swap/limit';

const baseUrl: string = 'https://hidingbook.keeperdao.com/api/v1';

export const swapLimit = async (
  fromToken: TokenListItem,
  toToken: TokenListItem,
  from: string,
  to: string,
  user: string,
  duration: plugin.Duration,
  onPrompt: Function
) => {
  const fromIsEth = ethToken.toLowerCase() === fromToken.address.toLowerCase();

  if (fromIsEth) {
    const success = await depositWeth(from, user, onPrompt);
  }

  const newFrom = fromIsEth ? { ...fromToken, address: wethToken } : fromToken;

  await createOrder(
    newFrom,
    toToken,
    from,
    to,
    user,
    duration.asSeconds(),
    onPrompt
  );
};

export const getTxOrigin = async (): Promise<string> => {
  const res = await getInfo();
  return res.txOrigin;
};
const getInfo = async () => {
  const res = await axios.get(`${baseUrl}/info`);
  return res.data.result.orderDetails;
};

export const getOrders = async (currentUser: string): Promise<LimitOrder[]> => {
  const res = await axios.get<{ orders: OrderResponse[] }>(
    `${baseUrl}/orders?maker=${currentUser}`,
    {
      transformResponse: (res) => JSONbig.parse(res),
    }
  );
  return orderResToLimit(res.data.orders);
};
const orderResToLimit = async (
  orders: OrderResponse[]
): Promise<LimitOrder[]> => {
  const tokens = await tokenList$.pipe(take(1)).toPromise();

  return orders.map((res) => {
    const payToken =
      tokens.find(
        (x) => x.address.toLowerCase() === res.order.makerToken.toLowerCase()
      ) ?? tokens[0];
    const getToken =
      tokens.find(
        (x) => x.address.toLowerCase() === res.order.takerToken.toLowerCase()
      ) ?? tokens[0];

    return {
      hash: res.metaData.orderHash,
      expiration: res.order.expiry,
      payToken,
      getToken,
      payAmount: res.order.makerAmount,
      getAmount: res.order.takerAmount,
      rate: `1 ${payToken.symbol} = ${res.order.takerAmount
        .div(res.order.makerAmount)
        .toFixed(9)} ${getToken.symbol}`,
      filled: new BigNumber(res.metaData.filledAmount_takerToken)
        .div(res.metaData.remainingFillableAmount_takerToken)
        .toFixed(2),
    };
  });
};

export const sendOrders = async (rfqOrder: RfqOrderJson[]) => {
  const url = `${baseUrl}/orders`;

  try {
    const res = await axios.post<{
      message: string;
      result: { hashList: string[] };
    }>(url, rfqOrder);

    const succeededResponseMessage = 'Order creation succeeded';
    if (res.data.message === succeededResponseMessage) {
      return res.data;
    } else {
      throw new Error(`Unexpected response from server, ${res.data.message}`);
    }
  } catch (e) {
    throw new Error(`Unexpected error during send order request ${e.message}`);
  }
};

export interface LimitOrder {
  hash: string;
  expiration: number;
  payToken: TokenListItem;
  getToken: TokenListItem;
  payAmount: BigNumber;
  getAmount: BigNumber;
  rate: string;
  filled: string;
}
export interface RfqOrderJson {
  maker: string;
  taker: string;
  makerToken: string;
  takerToken: string;
  makerAmount: string;
  takerAmount: string;
  txOrigin: string;
  pool: string;
  expiry: number;
  salt: string;
  chainId: number; // Ethereum Chain Id where the transaction is submitted.
  verifyingContract: string; // Address of the contract where the transaction should be sent.
  signature: Signature;
}
interface Signature {
  signatureType: number;
  v: number;
  r: string;
  s: string;
}

interface OrderResponse {
  order: Order;
  metaData: MetaData;
}
interface MetaData {
  orderHash: string;
  makerBalance_makerToken: number;
  makerAllowance_makerToken: number;
  status: OrderStatus;
  filledAmount_takerToken: number;
  remainingFillableAmount_takerToken: BigNumber;
}

enum OrderStatus {
  INVALID,
  FILLABLE,
  FILLED,
  CANCELLED,
  EXPIRED,
}

interface Order {
  maker: string;
  taker: string;
  makerAmount: BigNumber;
  takerAmount: BigNumber;
  makerToken: string;
  takerToken: string;
  salt: number;
  expiry: number;
  chainId: number;
  txOrigin: string;
  pool: string;
  verifyingContract: string;
  signature: Signature;
}
