import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'store';
import { LineChartSimple } from 'components/charts/LineChartSimple';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { useMemo } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { wethToken } from 'services/web3/config';
import { SearchInput } from 'components/searchInput/SearchInput';
import { sortNumbersByKey } from 'utils/pureFunctions';
import { getTokenTableData } from 'store/bancor/token';
import { Navigate } from 'components/navigate/Navigate';
import { BancorURL } from 'router/bancorURL.service';
import { Image } from 'components/image/Image';

interface Props {
  searchInput: string;
  setSearchInput: (value: string) => void;
}

export const TokenTable = ({ searchInput, setSearchInput }: Props) => {
  const tokens = useAppSelector(getTokenTableData);
  const search = searchInput.toLowerCase();

  const data = useMemo<Token[]>(() => {
    return tokens.filter((t) => {
      const isSearchMatch =
        t.symbol.toLowerCase().includes(search) ||
        t.name.toLowerCase().includes(search);

      return (
        toBigNumber(t.liquidity).gt(0) &&
        t.address !== wethToken &&
        isSearchMatch
      );
    });
  }, [tokens, search]);

  const CellName = (token: Token) => {
    return (
      <div className={'flex items-center'}>
        <Image
          src={token.logoURI.replace('thumb', 'small')}
          alt="Token"
          className="!rounded-full h-30 w-30 mr-10"
        />
        <h3 className="text-14">{token.symbol}</h3>
      </div>
    );
  };

  const columns = useMemo<TableColumn<Token>[]>(
    () => [
      {
        id: 'name',
        Header: 'Name',
        accessor: 'symbol',
        Cell: (cellData) => CellName(cellData.row.original),
        minWidth: 180,
        sortDescFirst: true,
      },
      {
        id: 'price',
        Header: 'Price',
        accessor: 'usdPrice',
        Cell: (cellData) => <>{prettifyNumber(cellData.value ?? 0, true)}</>,
        minWidth: 110,
        sortDescFirst: true,
      },
      {
        id: 'c24h',
        Header: '24h Change',
        accessor: 'price_change_24',
        Cell: (cellData) => {
          const changePositive = Number(cellData.value) > 0;
          return (
            <div
              className={`${changePositive ? 'text-success' : 'text-error'} `}
            >
              {`${changePositive ? '+' : ''}${cellData.value}%`}
            </div>
          );
        },
        sortType: (a, b) =>
          sortNumbersByKey(a.original, b.original, ['price_change_24']),
        minWidth: 110,
        sortDescFirst: true,
      },
      {
        id: 'v24h',
        Header: '24h Volume',
        accessor: 'usd_volume_24',
        Cell: (cellData) => <>{prettifyNumber(cellData.value ?? 0, true)}</>,
        minWidth: 120,
        sortDescFirst: true,
      },
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'liquidity',
        Cell: (cellData) => <>{prettifyNumber(cellData.value ?? 0, true)}</>,
        tooltip: 'The value of tokens staked in the pool',
        minWidth: 150,
        sortDescFirst: true,
      },
      {
        id: 'price7d',
        Header: 'Last 7 Days',
        accessor: 'price_history_7d',
        Cell: (cellData) => {
          const value = cellData.value;

          if (value.length === 0) return <div>N/A</div>;

          const changePositive =
            value[value.length - 1].value >= value[0].value;
          return (
            <LineChartSimple
              data={value}
              color={changePositive ? '#0FC7A6' : '#FF3F56'}
            />
          );
        },
        minWidth: 170,
        disableSortBy: true,
      },
      {
        id: 'actions',
        Header: '',
        accessor: 'symbol',
        Cell: (cellData) => {
          return (
            <Navigate
              to={BancorURL.trade({ from: cellData.row.original.address })}
              className="btn btn-secondary btn-xs"
            >
              Trade
            </Navigate>
          );
        },
        width: 50,
        minWidth: 50,
        disableSortBy: true,
      },
    ],
    []
  );

  const defaultSort: SortingRule<Token> = { id: 'liquidity', desc: true };

  return (
    <section className="pt-20 pb-10 content-block">
      <div className="flex justify-between items-center mb-20 mx-[20px]">
        <h2>Tokens</h2>
        <SearchInput
          value={searchInput}
          setValue={setSearchInput}
          className="max-w-[300px] rounded-20 h-[35px]"
        />
      </div>

      <DataTable<Token>
        data={data}
        columns={columns}
        defaultSort={defaultSort}
        isLoading={!tokens.length}
        stickyColumn
        search={searchInput}
      />
    </section>
  );
};
