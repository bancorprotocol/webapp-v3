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
import { classNameGenerator } from 'utils/pureFunctions';

export type TableColumn<D extends object> = Column<D> & {
  tooltip?: string;
  headerClassName?: string;
};

interface TableProps<D extends object> {
  columns: TableColumn<D>[];
  data: D[];
  defaultSort?: SortingRule<D>;
  isLoading?: boolean;
  stickyColumn?: boolean;
}

export const DataTable = <D extends object>({
  columns,
  data,
  defaultSort,
  isLoading,
  stickyColumn,
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
      autoResetSortBy: false,
      disableSortRemove: true,
      autoResetPage: false,
    },
    useSortBy,
    usePagination
  );

  return (
    <>
      <div
        className={`table-responsive ${classNameGenerator({
          'table-sticky-column': stickyColumn,
        })}`}
      >
        <table {...getTableProps()}>
          <TableHeader<D> headerGroups={headerGroups} columns={columns} />
          <TableBody<D>
            getTableBodyProps={getTableBodyProps}
            prepareRow={prepareRow}
            page={page}
          />
        </table>
      </div>
      {isLoading && (
        <div className="space-y-20 p-20">
          {[...Array(10)].map((_, index) => (
            <div
              key={index}
              className="w-full h-[30px] loading-skeleton !rounded-10"
            ></div>
          ))}
        </div>
      )}

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
