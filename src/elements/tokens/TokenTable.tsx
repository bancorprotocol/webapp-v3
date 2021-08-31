import { Image } from 'components/image/Image';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import { LineChartSimple } from 'components/charts/LineChartSimple';
import { LineData, UTCTimestamp } from 'lightweight-charts';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { useMemo, useState } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { NavLink } from 'react-router-dom';
import { wethToken } from 'services/web3/config';

export const TokenTable = () => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);
  const [searchInput, setSearchInput] = useState('');
  const data = useMemo<Token[]>(() => {
    return tokens.filter(
      (t) =>
        t.address !== wethToken &&
        (t.symbol.toLowerCase().includes(searchInput.toLowerCase()) ||
          t.name.toLowerCase().includes(searchInput.toLowerCase()))
    );
  }, [tokens, searchInput]);

  const convertChartData = (data: (string | number)[][]): LineData[] => {
    return data.map((x) => {
      return {
        time: x[0] as UTCTimestamp,
        value: Number(x[1]),
      };
    });
  };

  const CellName = (token: Token) => {
    return (
      <div className={'flex items-center'}>
        <div className="w-18">
          {token.isWhitelisted && (
            <IconProtected className={`w-18 h-20 text-primary`} />
          )}
        </div>

        <Image
          src={token.logoURI}
          alt="Token"
          className="bg-grey-2 rounded-full h-30 w-30 mr-10 ml-20"
        />
        <h3 className="text-14">{token.symbol}</h3>
      </div>
    );
  };

  const columns = useMemo<TableColumn<Token>[]>(
    () => [
      {
        id: 'name',
        Header: () => (
          <span className="align-middle inline-flex items-center">
            <IconProtected className="w-18 mr-20" /> <span>Name</span>
          </span>
        ),
        accessor: 'symbol',
        Cell: (cellData) => CellName(cellData.row.original),
        minWidth: 180,
        sortDescFirst: true,
      },
      {
        id: 'price',
        Header: 'Price',
        accessor: 'usdPrice',
        Cell: (cellData) => prettifyNumber(cellData.value ?? 0, true),
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
        minWidth: 110,
        sortDescFirst: true,
      },
      {
        id: 'v24h',
        Header: '24h Volume',
        accessor: 'usd_volume_24',
        Cell: (cellData) => prettifyNumber(cellData.value ?? 0, true),
        minWidth: 120,
        sortDescFirst: true,
      },
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'liquidity',
        Cell: (cellData) => prettifyNumber(cellData.value ?? 0, true),
        tooltip: 'The value of tokens staked in the pool',
        minWidth: 150,
        sortDescFirst: true,
      },
      {
        id: 'price7d',
        Header: 'Last 7 Days',
        accessor: 'price_history_7d',
        Cell: (cellData) => {
          const sanitized = cellData.value.filter((x) => !!x);
          if (sanitized.length === 0) {
            return <div>N/A</div>;
          }
          const latest = sanitized[sanitized.length - 1];
          const earliest = sanitized[0];
          if (!latest || !earliest || !latest[1] || !earliest[1]) {
            return <div>N/A</div>;
          }
          const changePositive = latest[1] > earliest[1];
          return (
            <LineChartSimple
              data={convertChartData(sanitized)}
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
        accessor: () => (
          <NavLink
            to="/"
            className="btn-primary btn-sm rounded-[12px] w-[94px] h-[29px]"
          >
            Trade
          </NavLink>
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
      <div className="flex justify-between items-center mb-20 mx-[20px] md:mx-[44px]">
        <h2>Tokens</h2>
        <div className="relative">
          <IconSearch className="absolute w-16 ml-14 text-grey-3" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search"
            className="block w-full max-w-[160px] border border-grey-2 rounded-10 pl-[38px] h-[35px] dark:bg-blue-4 dark:border-grey-4 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <DataTable<Token>
        data={data}
        columns={columns}
        defaultSort={defaultSort}
        isLoading={!tokens.length}
        stickyColumn
      />
    </section>
  );
};
