import { ReactComponent as IconTimes } from 'assets/icons/times.svg';
import { withdrawWeth } from 'services/web3/swap/limit';
import { useWeb3React } from '@web3-react/core';
import { useInterval } from 'hooks/useInterval';
import { cancelOrders, getOrders, LimitOrder } from 'services/api/keeperDao';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Token } from 'services/observables/tokens';
import { useDispatch } from 'react-redux';
import { addNotification } from 'redux/notification/notification';
import { useAppSelector } from 'redux/index';
import { wethToken } from 'services/web3/config';
import { prettifyNumber } from 'utils/helperFunctions';
import { Image } from 'components/image/Image';
import { SearchInput } from 'components/searchInput/SearchInput';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { SortingRule } from 'react-table';
import dayjs from 'dayjs';

export const SwapLimitTable = () => {
  const { account } = useWeb3React();
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [weth, setWeth] = useState<Token>();
  const [search, setSearch] = useState('');
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

  const defaultSort: SortingRule<LimitOrder> = { id: 'expiration', desc: true };

  const data = useMemo<LimitOrder[]>(() => {
    return orders.filter(
      (t) =>
        t.getToken.symbol.toLowerCase().includes(search.toLowerCase()) ||
        t.payToken.symbol.toLowerCase().includes(search.toLowerCase())
    );
  }, [orders, search]);

  const handleWithdrawWeth = useCallback(async () => {
    weth &&
      weth.balance &&
      dispatch(addNotification(await withdrawWeth(weth.balance)));
  }, [dispatch, weth]);

  const handleCancelOrders = useCallback(async () => {
    dispatch(
      addNotification(await cancelOrders(orders.map((x) => x.orderRes)))
    );
  }, [dispatch, orders]);

  const columns = useMemo<TableColumn<LimitOrder>[]>(
    () => [
      {
        id: 'expiration',
        Header: 'Expiration',
        accessor: 'expiration',
        Cell: (expiration) => (
          <>
            <span className="text-primary mr-12">
              {dayjs.unix(expiration.value).format('DD/MM/YYYY')}
            </span>
            <span>{dayjs.unix(expiration.value).format('h:mm:ss A')}</span>
          </>
        ),
        minWidth: 240,
        sortDescFirst: true,
      },
      {
        id: 'payAmount',
        Header: 'You pay',
        accessor: 'payAmount',
        Cell: (payAmount) => {
          const payToken = payAmount.row.original.payToken;
          return (
            <div className={'flex items-center'}>
              <Image
                src={payToken.logoURI}
                alt="Token"
                className="bg-grey-2 rounded-full h-28 w-28 mr-5"
              />
              {`${payToken.symbol} ${payAmount.value}`}
            </div>
          );
        },
        minWidth: 200,
        sortDescFirst: true,
      },
      {
        id: 'getAmount',
        Header: 'You get',
        accessor: 'getAmount',
        Cell: (getAmount) => {
          const getToken = getAmount.row.original.getToken;
          return (
            <div className={'flex items-center'}>
              <Image
                src={getToken.logoURI}
                alt="Token"
                className="bg-grey-2 rounded-full h-28 w-28 mr-5"
              />
              {`${getToken.symbol} ${getAmount.value}`}
            </div>
          );
        },
        minWidth: 200,
        sortDescFirst: true,
      },
      {
        id: 'rate',
        Header: 'Rate',
        accessor: 'rate',
        Cell: (rate) => rate.value,
        minWidth: 200,
        sortDescFirst: true,
      },
      {
        id: 'filled',
        Header: 'Filled',
        accessor: 'filled',
        Cell: (filled) => prettifyNumber(filled.value ?? 0) + '%',
        minWidth: 70,
        sortDescFirst: true,
      },
      {
        id: 'actions',
        Header: '',
        accessor: 'hash',
        Cell: (cellData) => {
          return (
            <button
              className={'hover:text-error py-5 pl-5 transition duration-200'}
              onClick={async () =>
                dispatch(
                  addNotification(
                    await cancelOrders([cellData.row.original.orderRes])
                  )
                )
              }
            >
              <IconTimes className={'w-10'} />
            </button>
          );
        },
        width: 50,
        minWidth: 50,
        disableSortBy: true,
      },
    ],
    [dispatch]
  );

  if (!account || orders.length === 0) return null;

  return (
    <section className="content-section pt-20 pb-10 mt-20">
      <div className="flex justify-between items-center mb-20 mx-[20px] md:mx-[44px]">
        <h2>Active Orders</h2>
        <div className="flex items-center gap-10">
          <SearchInput
            value={search}
            setValue={setSearch}
            className="max-w-[160px] rounded-10 h-[35px]"
          />
          <button
            className={'btn-outline-secondary btn-sm rounded-10'}
            onClick={() => handleCancelOrders()}
          >
            Cancel All
          </button>
          {weth && weth.balance && (
            <button
              className={'btn-outline-secondary btn-sm rounded-10'}
              onClick={() => handleWithdrawWeth()}
            >
              Withdraw {prettifyNumber(weth.balance)} WETH
            </button>
          )}
        </div>
      </div>

      <DataTable<LimitOrder>
        data={data}
        columns={columns}
        defaultSort={defaultSort}
        isLoading={!tokens.length}
        stickyColumn
        search={search}
      />
    </section>
  );
};
