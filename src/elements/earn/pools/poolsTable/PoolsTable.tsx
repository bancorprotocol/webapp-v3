import { Pool, Token } from 'services/observables/tokens';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { useMemo, useState } from 'react';
import { SortingRule, Row } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useAppSelector } from 'redux/index';
import { PoolsTableCellName } from 'elements/earn/pools/poolsTable/PoolsTableCellName';
import { PoolsTableCellRewards } from 'elements/earn/pools/poolsTable/PoolsTableCellRewards';
//import { ModalCreatePool } from 'elements/modalCreatePool/ModalCreatePool';
import { PoolsTableCellApr } from 'elements/earn/pools/poolsTable/PoolsTableCellApr';
import { SearchInput } from 'components/searchInput/SearchInput';
import { Button, ButtonVariant } from 'components/button/Button';
import { PoolsTableCellActions } from './PoolsTableCellActions';
import { Popularity } from 'components/popularity/popularity';
//import { Dropdown } from 'components/dropdown/Dropdown';

interface Props {
  search: string;
  setSearch: (value: string) => void;
}

export const PoolsTable = ({ search, setSearch }: Props) => {
  const v2pools = useAppSelector<Pool[]>((state) => state.pool.pools);
  const [v3Selected, setV3Selected] = useState(true);

  const v2data = useMemo<Pool[]>(() => {
    return v2pools.filter(
      (p) => p.name && p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [v2pools, search]);

  const v2columns = useMemo<TableColumn<Pool>[]>(
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
        Header: 'Protected',
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
        Cell: (cellData) => cellData.value && <Popularity stars={5} />,
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
        headerClassName: 'justify-center',
        Cell: (cellData) => PoolsTableCellApr(cellData.row.original),
        minWidth: 250,
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

  const switchV3Selected = () => setV3Selected(!v3Selected);
  const buttonVariant = (v3: boolean) =>
    (v3Selected && v3) || (!v3 && !v3Selected)
      ? ButtonVariant.PRIMARY
      : ButtonVariant.SECONDARY;

  const defaultSort: SortingRule<Token> = { id: 'liquidity', desc: true };

  return (
    <section className="content-section pt-20 pb-10">
      <div className="flex justify-between items-center mb-20 mx-[20px] md:mx-[44px]">
        <div className="flex items-center gap-x-10">
          <Button
            variant={buttonVariant(true)}
            onClick={() => switchV3Selected()}
          >
            V3
          </Button>
          <Button
            variant={buttonVariant(false)}
            onClick={() => switchV3Selected()}
          >
            V2
          </Button>
          <div className="mr-16">
            <SearchInput
              value={search}
              setValue={setSearch}
              className="max-w-[300px] rounded-20 h-[35px]"
            />
          </div>
        </div>
        {/* <Dropdown /> */}
        {/* <div className="hidden md:block">
          <ModalCreatePool />
        </div> */}
      </div>

      <DataTable<Pool>
        data={v2data}
        columns={v3Selected ? v2columns : v2columns}
        defaultSort={defaultSort}
        isLoading={!v2pools.length}
        search={search}
      />
    </section>
  );
};
