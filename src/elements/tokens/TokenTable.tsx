import { Image } from 'components/image/Image';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import { LineChartSimple } from 'components/charts/LineChartSimple';
import { LineData, UTCTimestamp } from 'lightweight-charts';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { useMemo } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';

export const TokenTable = () => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const data = useMemo<Token[]>(() => tokens, [tokens]);

  const convertChartData = (data: (string | number)[][]): LineData[] => {
    return data
      .filter((x) => x !== null)
      .map((x) => {
        return {
          time: x[0] as UTCTimestamp,
          value: Number(x[1]),
        };
      });
  };

  const CellName = (token: Token) => {
    return (
      <div className={'flex items-center'}>
        <Image
          src={token.logoURI}
          alt="Token"
          className="bg-grey-2 rounded-full h-30 w-30 mr-10"
        />
        <div>
          <h3>{token.symbol}</h3>
          <span className="text-12 text-grey-3">{token.name}</span>
        </div>
      </div>
    );
  };

  const columns = useMemo<TableColumn<Token>[]>(
    () => [
      {
        id: 'protected',
        Header: 'Protected',
        accessor: () => <IconProtected className="w-18 h-20 text-primary" />,
        width: 120,
        minWidth: 120,
        tooltip: 'Some awesome text here',
      },
      {
        id: 'name',
        Header: 'Name',
        accessor: 'symbol',
        Cell: (cellData) => CellName(cellData.row.original),
        tooltip: 'Some awesome text here',
        minWidth: 180,
      },
      {
        id: 'price',
        Header: 'Price',
        accessor: 'usdPrice',
        Cell: (cellData) => prettifyNumber(cellData.value ?? 0, true),
        tooltip: 'Some awesome text here',
        minWidth: 110,
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
        tooltip: 'Some awesome text here',
        minWidth: 110,
      },
      {
        id: 'v25h',
        Header: '24h Volume',
        accessor: () => '$12,123,123',
        tooltip: 'Some awesome text here',
        minWidth: 120,
      },
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'liquidity',
        Cell: (cellData) => prettifyNumber(cellData.value ?? 0, true),
        tooltip: 'Some awesome text here',
        minWidth: 150,
      },
      {
        id: 'price7d',
        Header: 'Last 7 Days',
        accessor: 'price_history_7d',
        Cell: (cellData) => {
          const changePositive =
            Number(cellData.row.original.price_change_24) > 0;
          return (
            <LineChartSimple
              data={convertChartData(cellData.value)}
              color={changePositive ? '#0ED3B0' : '#FF3F56'}
            />
          );
        },
        tooltip: 'Some awesome text here',
        minWidth: 170,
        disableSortBy: true,
      },
      {
        id: 'actions',
        Header: '',
        accessor: () => (
          <button className="btn-primary btn-sm rounded-[12px]">Trade</button>
        ),
        width: 50,
        minWidth: 50,
        disableSortBy: true,
      },
    ],
    []
  );

  const defaultSort: SortingRule<Token> = { id: 'liquidity', desc: true };

  return (
    <section className="content-section pt-20 pb-10">
      <h2 className="ml-20 mb-20">Tokens</h2>

      <DataTable<Token>
        data={data}
        columns={columns}
        defaultSort={defaultSort}
        isLoading={!tokens.length}
      />
    </section>
  );
};
