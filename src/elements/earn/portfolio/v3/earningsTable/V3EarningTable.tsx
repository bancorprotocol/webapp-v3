import { DataTable, TableColumn } from 'components/table/DataTable';
import { useMemo, useState } from 'react';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import V3WithdrawModal from 'elements/earn/portfolio/v3/withdraw/V3WithdrawModal';
import { V3EarningTableMenu } from 'elements/earn/portfolio/v3/earningsTable/menu/V3EarningTableMenu';
import { useAppSelector } from 'redux/index';
import { getRewardsEarnings } from 'redux/portfolio/v3Portfolio';
import { RewardsEarning } from 'redux/portfolio/v3Portfolio.types';

export const V3EarningTable = () => {
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const rewardsEarnings = useAppSelector(getRewardsEarnings);

  const data = useMemo(() => rewardsEarnings, [rewardsEarnings]);

  const columns = useMemo<TableColumn<RewardsEarning>[]>(
    () => [
      {
        id: 'programId',
        Header: '',
        accessor: 'programId',
        Cell: () => (
          <TokenBalance
            symbol="ETH"
            amount={'123123'}
            imgUrl={''}
            usdPrice={'1.123'}
          />
        ),
        minWidth: 225,
        disableSortBy: true,
      },
      {
        id: 'totalGains',
        Header: 'Total gains',
        Cell: () => 'ETH 123123',
        tooltip: 'Tooltip text',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'roi',
        Header: 'Total returns',
        Cell: () => <span className="text-primary">7.5%</span>,
        tooltip: 'Tooltip text',
        minWidth: 130,
        sortDescFirst: true,
      },
      {
        id: 'actions',
        Header: '',
        Cell: () => (
          <V3EarningTableMenu setIsWithdrawModalOpen={setIsWithdrawModalOpen} />
        ),
        width: 50,
        minWidth: 50,
        disableSortBy: true,
      },
    ],
    []
  );
  return (
    <section className="content-block pt-20">
      <div className="absolute z-30 pt-10 pl-40">
        <h2 className="text-[22px]">Earnings</h2>
      </div>

      <DataTable<RewardsEarning> data={data} columns={columns} stickyColumn />

      <V3WithdrawModal
        isOpen={isWithdrawModalOpen}
        setIsOpen={setIsWithdrawModalOpen}
      />
    </section>
  );
};
