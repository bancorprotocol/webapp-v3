import { ReactComponent as IconSearch } from 'assets/icons/search.svg';
import { DataTable } from 'components/table/DataTable';
import { useProtectedPositions } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/useProtectedPositions';
import { ProtectedPositionGrouped } from 'services/web3/protection/positions';

export const ProtectedPositionsTable = ({ loading }: { loading: boolean }) => {
  const { data, columns, search, setSearch } = useProtectedPositions();

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

      <DataTable<ProtectedPositionGrouped>
        data={data}
        columns={columns}
        isLoading={loading}
        stickyColumn
      />
    </section>
  );
};
