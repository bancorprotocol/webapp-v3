import axios from 'axios';
import BigNumber from 'bignumber.js';
import JSONbig from 'json-bigint';
import {
  BaseNotification,
  NotificationType,
} from 'redux/notification/notification';
import { take } from 'rxjs/operators';
import { exchangeProxy$ } from 'services/observables/contracts';
import { tokens$, Token } from 'services/observables/tokens';
import { resolveTxOnConfirmation } from 'services/web3';
import { ethToken, wethToken } from 'services/web3/config';
import {
  buildExchangeProxyContract,
  StringRfq,
} from 'services/web3/contracts/exchangeProxy/wrapper';
import { createOrder, depositWeth } from 'services/web3/swap/limit';
import { prettifyNumber } from 'utils/helperFunctions';
import { shrinkToken } from 'utils/pureFunctions';

const baseUrl: string = 'https://hidingbook.keeperdao.com/api/v1';

enum OrderStatus {
  Invalid,
  Fillable,
  Filled,
  Cancelled,
  Expired,
}

export const swapLimit = async (
  fromToken: Token,
  toToken: Token,
  from: string,
  to: string,
  user: string,
  duration: plugin.Duration,
  checkApproval: Function
): Promise<BaseNotification | undefined> => {
  const fromIsEth = ethToken === fromToken.address;

  try {
    if (fromIsEth) {
      await depositWeth(from, user);
      await checkApproval({ ...fromToken, address: wethToken });
    } else {
      await createOrder(
        fromToken,
        toToken,
        from,
        to,
        user,
        duration.asSeconds()
      );
      return {
        type: NotificationType.success,
        title: 'Title',
        msg: 'Message',
      };
    }
  } catch (error) {
    return {
      type: NotificationType.error,
      title: 'Title',
      msg: 'Message',
    };
  }
};

export const getTxOrigin = async (): Promise<string> => {
  const res = await getInfo();
  return res.txOrigin;
};
const getInfo = async () => {
  const res = await axios.get(`${baseUrl}/info`);
  return res.data.result.orderDetails;
};
export interface KeeprDaoToken {
  address: string;
  chainId: number;
  decimals: number;
  symbol: string;
}

export const fetchKeeperDaoTokens = async (): Promise<KeeprDaoToken[]> => {
  try {
    const tokens = await tokens$.pipe(take(1)).toPromise();
    const res = await axios.get(`${baseUrl}/tokenList`);
    return res.data.result.tokens;
  } catch (error) {
    console.error('Failed fetching keeperDao Tokens: ', error);
    return [];
  }
};

export const getOrders = async (currentUser: string): Promise<LimitOrder[]> => {
  const res = await axios.get<{ orders: OrderResponse[] }>(
    `${baseUrl}/orders?maker=${currentUser}`,
    {
      transformResponse: (res) => JSONbig.parse(res),
    }
  );

  return orderResToLimit(
    res.data.orders.filter(
      (order) => order.metaData.status !== OrderStatus.Cancelled
    )
  );
};
const orderResToLimit = async (
  orders: OrderResponse[]
): Promise<LimitOrder[]> => {
  const tokens = await tokens$.pipe(take(1)).toPromise();

  return orders.map((res) => {
    const payToken =
      tokens.find((x) => x.address === res.order.makerToken) ?? tokens[0];
    const getToken =
      tokens.find((x) => x.address === res.order.takerToken) ?? tokens[0];

    const payAmount = new BigNumber(res.order.makerAmount);
    const getAmount = new BigNumber(res.order.takerAmount);
    return {
      hash: res.metaData.orderHash,
      expiration: res.order.expiry,
      payToken,
      getToken,
      payAmount: prettifyNumber(shrinkToken(payAmount, payToken.decimals)),
      getAmount: prettifyNumber(shrinkToken(getAmount, getToken.decimals)),
      rate: `1 ${payToken.symbol} = ${prettifyNumber(
        getAmount.div(payAmount)
      )} ${getToken.symbol}`,
      filled: prettifyNumber(
        new BigNumber(res.metaData.filledAmount_takerToken).div(
          res.metaData.remainingFillableAmount_takerToken
        )
      ),
      orderRes: res,
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

export const cancelOrders = async (
  orders: OrderResponse[],
  user: string
): Promise<BaseNotification> => {
  const stringOrders = orders.map((limitOrder) =>
    orderToStringOrder(limitOrder.order)
  );
  const exchangeProxyAddress = await exchangeProxy$.pipe(take(1)).toPromise();
  const contract = buildExchangeProxyContract(exchangeProxyAddress);

  try {
    const txHash = await resolveTxOnConfirmation({
      tx:
        stringOrders.length === 1
          ? contract.methods.cancelRfqOrder(stringOrders[0])
          : contract.methods.batchCancelRfqOrders(stringOrders),
      user,
    });
    return {
      type: NotificationType.success,
      title: 'Title',
      msg: 'Message',
      txHash,
    };
  } catch (error) {
    return {
      type: NotificationType.error,
      title: 'Title',
      msg: 'Message',
    };
  }
};

const orderToStringOrder = (order: Order): StringRfq => ({
  expiry: String(order.expiry),
  makerAmount: order.makerAmount.toString(),
  salt: String(order.salt),
  takerAmount: order.takerAmount.toString(),
  maker: order.maker,
  makerToken: order.makerToken,
  pool: order.pool,
  taker: order.taker,
  takerToken: order.takerToken,
  txOrigin: order.txOrigin,
});

export interface LimitOrder {
  hash: string;
  expiration: number;
  payToken: Token;
  getToken: Token;
  payAmount: string;
  getAmount: string;
  rate: string;
  filled: string;
  orderRes: OrderResponse;
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
