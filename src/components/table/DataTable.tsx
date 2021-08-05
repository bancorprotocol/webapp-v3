import {
  Column,
  SortingRule,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';
import { TablePagination } from 'components/table/TablePagination';
import { TableHeader } from 'components/table/TableHeader';
import { TableBody } from 'components/table/TableBody';

interface TableProps<D extends object> {
  columns: Column<D>[];
  data: D[];
  defaultSort?: SortingRule<D>;
}

export const DataTable = <D extends object>({
  columns,
  data,
  defaultSort,
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
      initialState: {
        pageIndex: 0,
        sortBy: defaultSort ? [defaultSort] : [],
      },
      disableSortRemove: true,
    },
    useSortBy,
    usePagination
  );

  const columnsWidth = columns.map((c) => {
    return {
      id: c.id as string,
      width: c.width as number | undefined,
      maxWidth: c.maxWidth as number | undefined,
      minWidth: c.minWidth as number | undefined,
    };
  });

  return (
    <>
      <div className={'overflow-x-scroll md:overflow-x-auto'}>
        <table {...getTableProps()}>
          <TableHeader<D>
            headerGroups={headerGroups}
            columnsWidth={columnsWidth}
          />
          <TableBody<D>
            getTableBodyProps={getTableBodyProps}
            prepareRow={prepareRow}
            page={page}
          />
        </table>
      </div>
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
