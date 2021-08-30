import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { withdrawWeth } from 'services/web3/swap/limit';
import { useWeb3React } from '@web3-react/core';
import { useInterval } from 'hooks/useInterval';
import { cancelOrders, getOrders, LimitOrder } from 'services/api/keeperDao';
import { useCallback, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Token } from 'services/observables/tokens';
import { useDispatch } from 'react-redux';
import { addNotification } from 'redux/notification/notification';
import { useAppSelector } from 'redux/index';
import { wethToken } from 'services/web3/config';
import { prettifyNumber } from 'utils/helperFunctions';
import { Image } from 'components/image/Image';

export const SwapLimitTable = () => {
  const { account } = useWeb3React();
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [weth, setWeth] = useState<Token>();
  const dispatch = useDispatch();
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);

  const refreshOrders = useCallback(async () => {
    if (account) setOrders(await getOrders(account));
  }, [account]);

  useEffect(() => {
    const weth = tokens.find((x) => x.address === wethToken);
    if (weth) setWeth(weth);
  }, [tokens]);

  useInterval(() => {
    refreshOrders();
  }, 60000);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  if (!account || orders.length === 0) return null;

  return (
    <div className="md:rounded-30 bg-white dark:bg-blue-4 md:shadow-widget my-40 pb-10">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center md:h-60 md:px-20">
        <div>
          <h2>Active Orders</h2>
        </div>
        <div
          className={'flex flex-col md:flex-row md:items-center md:space-x-10'}
        >
          <div className="relative">
            <IconSearch className="absolute w-12 ml-10 text-grey-3" />
            <input
              type="text"
              placeholder="Search"
              className="block w-full border border-grey-3 rounded-10 pl-30 h-28 focus:outline-none focus:border-primary"
            />
          </div>
          <div className={'flex'}>
            <button
              className={'btn-outline-secondary btn-sm rounded-10 mr-10'}
              onClick={async () =>
                dispatch(
                  addNotification(
                    await cancelOrders(
                      orders.map((x) => x.orderRes),
                      account
                    )
                  )
                )
              }
            >
              Cancel All
            </button>
            {weth && weth.balance && (
              <button
                className={'btn-outline-secondary btn-sm rounded-10'}
                onClick={async () =>
                  weth.balance &&
                  dispatch(
                    addNotification(await withdrawWeth(weth.balance, account))
                  )
                }
              >
                Withdraw {prettifyNumber(weth.balance)} WETH
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={'overflow-x-scroll md:overflow-x-auto'}>
        <table className={'w-full'}>
          <thead>
            <tr>
              <th className={'min-w-[240px]'}>Expiration</th>
              <th className={'min-w-[200px]'}>You pay</th>
              <th className={'min-w-[200px]'}>You get</th>
              <th className={'min-w-[200px]'}>Rate</th>
              <th className={'min-w-[70px]'}>Filled</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              return (
                <tr key={order.hash}>
                  <td>
                    <span className="text-primary mr-12">
                      {dayjs.unix(order.expiration).format('DD/MM/YYYY')}
                    </span>
                    <span>
                      {dayjs.unix(order.expiration).format('h:mm:ss A')}
                    </span>
                  </td>
                  <td>
                    <div className={'flex items-center'}>
                      <Image
                        src={order.payToken.logoURI}
                        alt="Token"
                        className="bg-grey-2 rounded-full h-28 w-28 mr-5"
                      />
                      {`${order.payToken.symbol} ${order.payAmount}`}
                    </div>
                  </td>
                  <td>
                    <div className={'flex items-center'}>
                      <Image
                        src={order.getToken.logoURI}
                        alt="Token"
                        className="bg-grey-2 rounded-full h-28 w-28 mr-5"
                      />
                      {`${order.getToken.symbol} ${order.getAmount}`}
                    </div>
                  </td>
                  <td>{order.rate}</td>
                  <td>{`${order.filled}%`}</td>
                  <td className={'w-15'}>
                    <button
                      className={
                        'hover:text-error py-5 pl-5 transition duration-200'
                      }
                      onClick={async () =>
                        dispatch(
                          addNotification(
                            await cancelOrders([order.orderRes], account)
                          )
                        )
                      }
                    >
                      <IconTimes className={'w-10'} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
