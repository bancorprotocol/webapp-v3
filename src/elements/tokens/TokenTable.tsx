import { Image } from 'components/image/Image';
import { Token } from 'services/observables/tokens';
import { useAppSelector } from 'redux/index';
import { LineChartSimple } from 'components/charts/LineChartSimple';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { useMemo } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { NavLink } from 'react-router-dom';
import { wethToken } from 'services/web3/config';
import { SearchInput } from 'components/searchInput/SearchInput';
import { swapByfrom } from 'services/router';

interface Props {
  searchInput: string;
  setSearchInput: (value: string) => void;
}

export const TokenTable = ({ searchInput, setSearchInput }: Props) => {
  const tokens = useAppSelector<Token[]>((state) => state.bancor.tokens);

  const data = useMemo<Token[]>(() => {
    return tokens.filter(
      (t) =>
        t.address !== wethToken &&
        (t.symbol.toLowerCase().includes(searchInput.toLowerCase()) ||
          t.name.toLowerCase().includes(searchInput.toLowerCase()))
    );
  }, [tokens, searchInput]);

  const CellName = (token: Token) => {
    return (
      <div className={'flex items-center'}>
        <div className="w-18">
          {token.isWhitelisted && (
            <IconProtected className={`w-18 h-20 text-primary`} />
          )}
        </div>

        <Image
          src={token.logoURI.replace('thumb', 'small')}
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
            <NavLink
              to={swapByfrom(cellData.row.original.address)}
              className="btn-primary btn-sm rounded-[12px] w-[94px] h-[29px]"
            >
              Trade
            </NavLink>
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
    <section className="content-section pt-20 pb-10">
      <div className="flex justify-between items-center mb-20 mx-[20px] md:mx-[44px]">
        <h2>Tokens</h2>
        <SearchInput
          value={searchInput}
          setValue={setSearchInput}
          className="max-w-[160px] rounded-10 h-[35px]"
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
