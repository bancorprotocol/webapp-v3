import axios from 'axios';
import BigNumber from 'bignumber.js';
import JSONbig from 'json-bigint';
import {
  BaseNotification,
  NotificationType,
} from 'store/notification/notification';
import { take } from 'rxjs/operators';
import { Token, TokenMinimal, tokensV2$ } from 'services/observables/tokens';
import { writeWeb3 } from 'services/web3';
import { createOrder } from 'services/web3/swap/limit';
import { prettifyNumber } from 'utils/helperFunctions';
import { utils } from 'ethers';
import { ErrorCode } from 'services/web3/types';
import { shrinkToken } from 'utils/formulas';
import { ExchangeProxy__factory } from 'services/web3/abis/types';
import { exchangeProxy$ } from 'services/observables/contracts';
import { sendConversionEvent } from './googleTagManager/conversion';
import { Events } from './googleTagManager';

const baseUrl: string = 'https://hidingbook.keeperdao.com/api/v1';

enum OrderStatus {
  Invalid,
  Fillable,
  Filled,
  Cancelled,
  Expired,
}

interface StringRfq {
  makerToken: string;
  takerToken: string;
  makerAmount: string;
  takerAmount: string;
  maker: string;
  taker: string;
  txOrigin: string;
  pool: string;
  expiry: string;
  salt: string;
}

export const swapLimit = async (
  fromToken: TokenMinimal,
  toToken: TokenMinimal,
  from: string,
  to: string,
  user: string,
  duration: plugin.Duration,
  onHash: () => void,
  onCompleted: () => void,
  rejected: () => void,
  failed: (error: string) => void
) => {
  try {
    onHash();
    sendConversionEvent(Events.wallet_req);
    await createOrder(fromToken, toToken, from, to, user, duration.asSeconds());
    sendConversionEvent(Events.success);
    onCompleted();
  } catch (e: any) {
    sendConversionEvent(Events.fail, undefined, undefined, e.message);
    if (e.code === ErrorCode.DeniedTx) rejected();
    else failed(e.message);
  }
};

export const getOrderDetails = async (): Promise<OrderDetails> => {
  const res = await axios.get(`${baseUrl}/info`);
  return res.data.result.orderDetails;
};

type OrderDetails = {
  verifyingContract: string;
  chainId: number;
  txOrigin: string;
  taker: string;
  pool: string;
};

export interface KeeprDaoToken {
  address: string;
  chainId: number;
  decimals: number;
  symbol: string;
}

export const fetchKeeperDaoTokens = async (): Promise<KeeprDaoToken[]> => {
  try {
    const res = await axios.get(`${baseUrl}/tokenList`);
    const tokens: KeeprDaoToken[] = res.data.result.tokens;
    return tokens.map((x) => ({ ...x, address: utils.getAddress(x.address) }));
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
  const tokens = await tokensV2$.pipe(take(1)).toPromise();

  return orders.map((res) => {
    const payToken =
      tokens.find(
        (x) => x.address === utils.getAddress(res.order.makerToken)
      ) ?? tokens[0];
    const getToken =
      tokens.find(
        (x) => x.address === utils.getAddress(res.order.takerToken)
      ) ?? tokens[0];

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

    if (res.status === 201) return res.data;

    throw new Error(`Unexpected response from server, ${res.data.message}`);
  } catch (e: any) {
    throw new Error(`Unexpected error during send order request ${e.message}`);
  }
};

export const cancelOrders = async (
  orders: OrderResponse[]
): Promise<BaseNotification> => {
  const stringOrders = orders.map((limitOrder) =>
    orderToStringOrder(limitOrder.order)
  );
  const exchangeProxyAddress = await exchangeProxy$.pipe(take(1)).toPromise();
  const contract = ExchangeProxy__factory.connect(
    exchangeProxyAddress,
    writeWeb3.signer
  );

  try {
    const tx =
      stringOrders.length === 1
        ? await contract.cancelRfqOrder(stringOrders[0])
        : await contract.batchCancelRfqOrders(stringOrders);

    return {
      type: NotificationType.pending,
      title: 'Pending Confirmation',
      msg: 'Transaction is pending confirmationn',
      txHash: tx.hash,
      updatedInfo: {
        successTitle: 'Success!',
        successMsg: 'Canceling your limit orders has been confirmed',
        errorTitle: 'Transaction Failed',
        errorMsg:
          'Transaction had failed. Please try again or contact support.',
      },
    };
  } catch (e: any) {
    if (e.code === ErrorCode.DeniedTx)
      return {
        type: NotificationType.error,
        title: 'Transaction Rejected',
        msg: 'You rejected the transaction. If this was by mistake, please try again.',
      };

    return {
      type: NotificationType.error,
      title: 'Transaction Failed',
      msg: 'Transaction had failed. Please try again or contact support.',
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
  salt: number;
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
