import { Pool, Token } from 'services/observables/tokens';
import { prettifyNumber } from 'utils/helperFunctions';
import { ReactComponent as IconProtected } from 'assets/icons/protected.svg';
import { ReactComponent as IconClock } from 'assets/icons/clock.svg';
import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { ReactComponent as IconSync } from 'assets/icons/sync.svg';
import { ReactComponent as IconPlus } from 'assets/icons/plus-circle.svg';
import { useMemo } from 'react';
import { SortingRule } from 'react-table';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { NavLink } from 'react-router-dom';
import { Image } from 'components/image/Image';
import { Tooltip } from 'components/tooltip/Tooltip';
import { CountdownTimer } from 'components/countdownTimer/CountdownTimer';

interface Props {
  pools: Pool[];
  search: string;
  setSearch: Function;
}

export const PoolsTable = ({ pools, search, setSearch }: Props) => {
  const data = useMemo<Pool[]>(() => {
    return pools.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [pools, search]);

  const CellName = (pool: Pool) => {
    return (
      <div className={'flex items-center'}>
        <div className="w-18">
          {pool.isWhitelisted && (
            <IconProtected className={`w-18 h-20 text-primary`} />
          )}
        </div>
        <div className="flex ml-20">
          <Image
            src={pool.reserves[0].logoURI.replace('thumb', 'small')}
            alt="Token Logo"
            className="bg-grey-1 rounded-full w-30 h-30 z-20"
          />
          <Image
            src={pool.reserves[1].logoURI.replace('thumb', 'small')}
            alt="Token Logo"
            className="-ml-12 bg-grey-1 rounded-full w-30 h-30 z-10"
          />
        </div>
        <h3 className="text-14 ml-10">{pool.name}</h3>
      </div>
    );
  };

  const CellReward = (pool: Pool) => {
    const aprOne = pool.reserves[0].rewardApr;
    const aprTwo = pool.reserves[1].rewardApr;
    const symbolOne = pool.reserves[0].symbol;
    const symbolTwo = pool.reserves[1].symbol;
    const ends_at = pool.reward?.ends_at;
    return aprOne && aprTwo && ends_at ? (
      <div className="flex items-center">
        <Tooltip
          content={
            <span>
              Rewards end in <CountdownTimer date={ends_at} />
            </span>
          }
          button={<IconClock className="w-10" />}
        />
        <span className="ml-10">{`${symbolOne} ${aprOne.toFixed(2)}%`}</span>
        <span className="px-10">|</span>
        <span>{`${symbolTwo} ${aprTwo.toFixed(2)}%`}</span>
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
        minWidth: 230,
        sortDescFirst: true,
      },
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'liquidity',
        Cell: (cellData) => prettifyNumber(cellData.value, true),
        tooltip: 'The value of tokens staked in the pool.',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'fee',
        Header: 'Fee',
        accessor: 'fee',
        Cell: (cellData) => `${cellData.value.toFixed(2)}%`,
        minWidth: 80,
        sortDescFirst: true,
        tooltip:
          'The % deducted from each swap and re-deposited into the pool.',
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
        minWidth: 90,
        sortDescFirst: true,
      },
      {
        id: 'rewards',
        Header: 'Rewards',
        accessor: 'reward',
        Cell: (cellData) => CellReward(cellData.row.original),
        minWidth: 230,
        disableSortBy: true,
        tooltip:
          'Estimated APR based on the maximum (2x multiplier) weekly BNT Liquidity Mining rewards. Counter indicates time until 12-week rewards cycle concludes.',
      },
      {
        id: 'apr',
        Header: 'APR',
        accessor: 'apr',
        Cell: (cellData) => `${cellData.value.toFixed(2)}%`,
        minWidth: 80,
        sortDescFirst: true,
        tooltip: '24h fees annualized divided by liquidity in the pool. ',
      },
      {
        id: 'actions',
        Header: '',
        accessor: () => (
          <div className="flex">
            <NavLink
              to="/"
              className="btn-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 shadow-header mr-10"
            >
              <Tooltip
                content="Coming Soon"
                button={
                  <IconPlus
                    className={`w-20 hover:rotate-180 transition-transform duration-300`}
                  />
                }
              />
            </NavLink>
            <NavLink
              to="/"
              className="btn-outline-primary btn-sm rounded-[12px] !w-[35px] !h-[35px] p-0 border shadow-header"
            >
              <Tooltip
                content="Trade"
                button={
                  <IconSync
                    className={`w-20 hover:rotate-180 transition-transform duration-300`}
                  />
                }
              />
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
