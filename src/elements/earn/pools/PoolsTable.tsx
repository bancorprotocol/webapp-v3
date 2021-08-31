import { Token } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { useMemo, useState } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { NavLink } from 'react-router-dom';
import { Pool } from 'services/observables/pools';
import { Image } from 'components/image/Image';
import dayjs from 'dayjs';

interface Props {
  pools: Pool[];
}

export const PoolsTable = ({ pools }: Props) => {
  const [searchInput, setSearchInput] = useState('');
  const data = useMemo<Pool[]>(() => {
    return pools.filter((p) =>
      p.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [pools, searchInput]);

  const CellName = (pool: Pool) => {
    return (
      <div className={'flex items-center'}>
        <div className="w-18">
          {pool.isWhitelisted && (
            <IconProtected className={`w-18 h-20 text-primary`} />
          )}
        </div>
        <h3 className="text-14 ml-20">{pool.name}</h3>
      </div>
    );
  };

  const CellReward = (pool: Pool) => {
    const aprOne = pool.reserves[0].apr;
    const aprTwo = pool.reserves[1].apr;
    const ends_at = pool.reward?.ends_at;
    return aprOne && aprTwo && ends_at ? (
      <div>
        <span>{`${aprOne}%`}</span>
        <span className="px-10">|</span>
        <span>{`${aprTwo}%`}</span>
        <div>{dayjs(ends_at).format('DD/MM/YY - HH:mm')}</div>
      </div>
    ) : (
      ''
    );
  };

  const columns = useMemo<TableColumn<Pool>[]>(
    () => [
      {
        id: 'name',
        Header: () => (
          <span className="align-middle inline-flex items-center">
            <IconProtected className="w-18 mr-20" /> <span>Name</span>
          </span>
        ),
        accessor: 'name',
        Cell: (cellData) => CellName(cellData.row.original),
        minWidth: 180,
        sortDescFirst: true,
      },
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'liquidity',
        Cell: (cellData) => prettifyNumber(cellData.value, true),
        tooltip: 'The value of tokens staked in the pool',
        minWidth: 150,
        sortDescFirst: true,
      },
      {
        id: 'fee',
        Header: 'Fee',
        accessor: 'fee',
        Cell: (cellData) => `${cellData.value.toFixed(2)}%`,
        minWidth: 110,
        sortDescFirst: true,
      },
      {
        id: 'v24h',
        Header: '24h Volume',
        accessor: 'volume_24h',
        Cell: (cellData) => prettifyNumber(cellData.value, true),
        minWidth: 120,
        sortDescFirst: true,
      },
      {
        id: 'f24h',
        Header: '24h Fees',
        accessor: 'fees_24h',
        Cell: (cellData) => prettifyNumber(cellData.value, true),
        minWidth: 120,
        sortDescFirst: true,
      },
      {
        id: 'rewards',
        Header: 'Reward',
        accessor: 'reward',
        Cell: (cellData) => CellReward(cellData.row.original),
        minWidth: 180,
        sortDescFirst: true,
      },
      {
        id: 'apr',
        Header: 'APR',
        accessor: 'apr',
        Cell: (cellData) => `${cellData.value.toFixed(2)}%`,
        minWidth: 60,
        sortDescFirst: true,
      },
      {
        id: 'actions',
        Header: '',
        accessor: () => (
          <div className="flex">
            <NavLink to="/" className="btn-primary btn-sm rounded-[12px]">
              x
            </NavLink>
            <NavLink to="/" className="btn-primary btn-sm rounded-[12px]">
              x
            </NavLink>
          </div>
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
        <h2>Pools</h2>
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

      <DataTable<Pool>
        data={data}
        columns={columns}
        defaultSort={defaultSort}
        isLoading={!pools.length}
        stickyColumn
      />
    </section>
  );
};
