import { Column, usePagination, useSortBy, useTable } from 'react-table';
import { TablePagination } from 'components/table/TablePagination';
import { TableHeader } from 'components/table/TableHeader';
import { TableBody } from 'components/table/TableBody';

interface TableProps<D extends object> {
  columns: Column<D>[];
  data: D[];
}

export const DataTable = <D extends object>({
  columns,
  data,
}: TableProps<D>) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, sortBy: [{ id: '3' }] },
      disableSortRemove: true,
    },
    useSortBy,
    usePagination
  );

  return (
    <>
      <table {...getTableProps()}>
        <TableHeader<D> headerGroups={headerGroups} />
        <TableBody<D>
          getTableBodyProps={getTableBodyProps}
          prepareRow={prepareRow}
          page={page}
        />
      </table>
      <TablePagination
        pageIndex={pageIndex}
        pageSize={pageSize}
        pageCount={pageCount}
        pageOptions={pageOptions}
        canPreviousPage={canPreviousPage}
        canNextPage={canNextPage}
        gotoPage={gotoPage}
        previousPage={previousPage}
        nextPage={nextPage}
        setPageSize={setPageSize}
      />
    </>
  );
};
