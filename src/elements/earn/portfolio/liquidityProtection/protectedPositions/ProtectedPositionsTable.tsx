import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { DataTable, TableColumn } from 'components/table/DataTable';
import { useMemo, useState } from 'react';
import { useWeb3React } from '@web3-react/core';
import { fetchProtectedPositions } from 'services/web3/protection/positions';
import useAsyncEffect from 'use-async-effect';
import { useAppSelector } from 'redux/index';
import { Pool } from 'services/observables/tokens';
import { ProtectedPositionTableCellAmount } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/ProtectedPositionTableCellStake';
import { prettifyNumber } from 'utils/helperFunctions';

export const ProtectedPositionsTable = () => {
  const pools = useAppSelector<Pool[]>((state) => state.pool.pools);

  const [search, setSearch] = useState('');
  const { account } = useWeb3React();
  const [positions, setPositions] = useState<any[]>([]);

  const data = useMemo(() => positions, [positions]);
  const columns = useMemo<TableColumn<any>[]>(
    () => [
      {
        id: 'liquidity',
        Header: 'Liquidity',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'initialStake',
        accessor: 'initialStake',
        Header: 'Initial Stake',
        Cell: (cellData) =>
          ProtectedPositionTableCellAmount({
            tknAmount: cellData.value.tknAmount,
            usdAmount: cellData.value.usdAmount,
            symbol: cellData.row.original.reserveToken.symbol,
          }),
        minWidth: 130,
        sortDescFirst: true,
        tooltip: 'Amount of tokens you originally staked in the pool',
      },
      {
        id: 'protected',
        accessor: 'protectedAmount',
        Header: 'Protected',
        Cell: (cellData) =>
          ProtectedPositionTableCellAmount({
            tknAmount: cellData.value.tknAmount,
            usdAmount: cellData.value.usdAmount,
            symbol: cellData.row.original.reserveToken.symbol,
          }),
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'Amount of tokens you can withdraw with 100% protection + fees',
      },
      {
        id: 'claimable',
        accessor: 'claimableAmount',
        Header: 'Claimable',
        Cell: (cellData) =>
          ProtectedPositionTableCellAmount({
            tknAmount: cellData.value.tknAmount,
            usdAmount: cellData.value.usdAmount,
            symbol: cellData.row.original.reserveToken.symbol,
          }),
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'Amount of tokens you can withdraw right now (assuming you have not earned full protection, this value will be lower than Protected Value)',
      },
      {
        id: 'feesRewards',
        Header: 'Fees & Rewards',
        Cell: (cellData) =>
          `${prettifyNumber(cellData.row.original.fees)} ${
            cellData.row.original.reserveToken.symbol
          }`,
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'Fees and rewards earned by your stake since you entered the pool.',
      },
      {
        id: 'roi',
        accessor: 'roi',
        Header: 'ROI',
        Cell: (cellData) => `${(cellData.value * 100).toFixed(2)} %`,
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'The ROI of your fully protected value vs. your initial stake.',
      },
      {
        id: 'apr',
        Header: 'APR',
        accessor: 'aprs',
        Cell: (cellData) => {
          return (
            <div>
              <div>Day {cellData.value.day}</div>
              <div>Week {cellData.value.week}</div>
            </div>
          );
        },
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'coverage',
        Header: 'Current Coverage',
        minWidth: 130,
        sortDescFirst: true,
        tooltip:
          'The impermanent loss protection you have accrued. Impermanent loss protection starts 30 days after your deposit, at a rate of 30% and gradually increases 1% per day until you reach 100% protection.',
      },
    ],
    []
  );

  useAsyncEffect(async () => {
    if (account && pools.length) {
      const positions = await fetchProtectedPositions(pools, account);
      setPositions(positions);
    }
  }, [account, pools.length]);

  return (
    <section className="content-section pt-20 pb-10">
      <div className="flex justify-between items-center mb-20 mx-[20px] md:mx-[44px]">
        <h2>My Protected Positions</h2>
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

      <DataTable<any>
        data={data}
        columns={columns}
        isLoading={!data.length}
        stickyColumn
      />
    </section>
  );
};
