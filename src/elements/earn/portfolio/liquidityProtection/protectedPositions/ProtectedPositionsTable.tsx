import { DataTable } from 'components/table/DataTable';
import { useProtectedPositions } from 'elements/earn/portfolio/liquidityProtection/protectedPositions/useProtectedPositions';
import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { SearchInput } from 'components/searchInput/SearchInput';

export const ProtectedPositionsTable = ({ loading }: { loading: boolean }) => {
  const { data, columns, search, setSearch } = useProtectedPositions();

  return (
    <section className="content-section pt-20 pb-10">
      <div className="flex justify-between items-center mb-20 mx-[20px] md:mx-[44px]">
        <h2>My Protected Positions</h2>
        <SearchInput
          value={search}
          setValue={setSearch}
          className="max-w-[160px] rounded-10 h-[35px]"
        />
      </div>

      <DataTable<ProtectedPositionGrouped>
        data={data}
        columns={columns}
        isLoading={loading}
        stickyColumn
        search={search}
      />
    </section>
  );
};
