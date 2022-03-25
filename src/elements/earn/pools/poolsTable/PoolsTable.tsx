import { Token } from 'services/observables/tokens';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { useMemo, useState } from 'react';
import { SortingRule, Row } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useAppSelector } from 'redux/index';
import { PoolsTableCellName } from 'elements/earn/pools/poolsTable/PoolsTableCellName';
import { PoolsTableCellRewards } from 'elements/earn/pools/poolsTable/PoolsTableCellRewards';
import { PoolsTableCellApr } from 'elements/earn/pools/poolsTable/PoolsTableCellApr';
import { SearchInput } from 'components/searchInput/SearchInput';
import { ButtonToggle } from 'components/button/Button';
import { PoolsTableCellActions } from './PoolsTableCellActions';
import { Popularity } from 'components/popularity/Popularity';
import { PoolsTableSort } from './PoolsTableSort';
import { Pool } from 'services/observables/pools';

interface Props {
  search: string;
  setSearch: (value: string) => void;
}

export const PoolsTable = ({ search, setSearch }: Props) => {
  const v2Pools = useAppSelector<Pool[]>((state) => state.pool.v2Pools);
  const v3Pools = useAppSelector<Pool[]>((state) => state.pool.v3Pools);
  const [v3Selected, setV3Selected] = useState(true);

  const v2Data = useMemo<Pool[]>(() => {
    return v2Pools
      .filter((p) => p.version >= 28)
      .filter(
        (p) => p.name && p.name.toLowerCase().includes(search.toLowerCase())
      );
  }, [v2Pools, search]);

  const v3Data = useMemo<Pool[]>(() => {
    return v3Pools.filter(
      (p) => p.name && p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [v3Pools, search]);

  const v2Columns = useMemo<TableColumn<Pool>[]>(
    () => [
      {
        id: 'name',
        Header: 'Name',
        accessor: 'name',
        Cell: (cellData) => PoolsTableCellName(cellData.row.original),
        minWidth: 150,
        width: 180,
        sortDescFirst: true,
      },
      {
        id: 'isProtected',
        Header: 'Protected',
        accessor: 'isProtected',
        headerClassName: 'justify-center',
        Cell: (cellData) =>
          cellData.value ? (
            <div className="flex justify-center">
              <IconProtected className="w-18 h-20 text-primary" />
            </div>
          ) : (
            <div />
          ),
        tooltip: 'Protected',
        minWidth: 160,
        sortDescFirst: true,
      },
      {
        id: 'popularity',
        Header: 'Popularity',
        accessor: 'isProtected',
        Cell: (cellData) => cellData.value && <Popularity stars={4} />,
        tooltip: 'Popularity',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'rewards',
        Header: 'Rewards',
        accessor: 'reward',
        Cell: (cellData) => PoolsTableCellRewards(cellData.row.original),
        minWidth: 100,
        sortDescFirst: true,
        sortType: (a: Row<Pool>, b: Row<Pool>, id: string) => {
          if (!!a.values[id] && !b.values[id]) return 1;
          if (!a.values[id] && !!b.values[id]) return -1;
          return a.values['liquidity'] > b.values['liquidity'] ? 1 : -1;
        },
        tooltip:
          'Active indicates a current liquidity mining program on the pool.',
      },
      {
        id: 'apr',
        Header: 'APR',
        accessor: 'apr',
        Cell: (cellData) => PoolsTableCellApr(cellData.row.original),
        minWidth: 180,
        disableSortBy: true,
        tooltip:
          'Estimated based on the maximum BNT Liquidity Mining rewards multiplier (2x) and annualized trading fees. ',
      },
      {
        id: 'actions',
        Header: '',
        accessor: 'pool_dlt_id',
        Cell: (cellData) => PoolsTableCellActions(cellData.value),
        width: 50,
        minWidth: 50,
        disableSortBy: true,
      },
    ],
    []
  );

  const v3Columns = useMemo<TableColumn<Pool>[]>(
    () => [
      {
        id: 'name',
        Header: 'Name',
        accessor: 'name',
        Cell: (cellData) => PoolsTableCellName(cellData.row.original),
        minWidth: 100,
        sortDescFirst: true,
      },
      {
        id: 'isProtected',
        Header: 'Earn',
        accessor: 'isProtected',
        Cell: (cellData) =>
          cellData.value ? (
            <IconProtected className="w-18 h-20 text-primary" />
          ) : (
            <div />
          ),
        tooltip: 'Protected',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'popularity',
        Header: 'Popularity',
        accessor: 'isProtected',
        Cell: (cellData) => cellData.value && <Popularity stars={4} />,
        tooltip: 'Popularity',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'actions',
        Header: '',
        accessor: 'pool_dlt_id',
        Cell: (cellData) => PoolsTableCellActions(cellData.value),
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
        <div className="flex items-center gap-x-10">
          <ButtonToggle
            labels={[
              <div
                key="v3"
                className="flex items-center gap-x-[4px] text-16 w-[40px]"
              >
                <IconProtected className="w-15" />
                V3
              </div>,
              <div key="v2" className="text-16 w-[25px]">
                V2
              </div>,
            ]}
            toggle={v3Selected}
            setToggle={() => setV3Selected(!v3Selected)}
          />
          <div className="mr-16">
            <SearchInput
              value={search}
              setValue={setSearch}
              className="max-w-[300px] rounded-20 h-[35px]"
            />
          </div>
        </div>
        <PoolsTableSort />
      </div>

      <DataTable<Pool>
        data={v3Selected ? v3Data : v2Data}
        columns={v3Selected ? v3Columns : v2Columns}
        defaultSort={defaultSort}
        isLoading={!v2Pools.length}
        search={search}
      />
    </section>
  );
};
