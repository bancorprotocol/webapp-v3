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

export type TableColumn<D extends object> = Column<D> & {
  tooltip?: string;
};

interface TableProps<D extends object> {
  columns: TableColumn<D>[];
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

  return (
    <>
      <div className={'overflow-x-scroll md:overflow-x-auto'}>
        <table {...getTableProps()}>
          <TableHeader<D> headerGroups={headerGroups} columns={columns} />
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
