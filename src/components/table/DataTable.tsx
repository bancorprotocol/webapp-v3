import {
  Column,
  SortingRule,
  useExpanded,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';
import { TablePagination } from 'components/table/TablePagination';
import { TableHeader } from 'components/table/TableHeader';
import { TableBody } from 'components/table/TableBody';
import { classNameGenerator } from 'utils/pureFunctions';
import { useEffect } from 'react';

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
  search?: string;
  noPagination?: boolean;
}

export const DataTable = <D extends object>({
  columns,
  data,
  defaultSort,
  isLoading,
  stickyColumn,
  search,
  noPagination = data.length <= 6,
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
      autoResetExpanded: false,
    },
    useSortBy,
    useExpanded,
    usePagination
  );

  useEffect(() => {
    gotoPage(0);
  }, [gotoPage, search]);

  return (
    <>
      <div
        className={`table-responsive ${classNameGenerator({
          'table-sticky-column': stickyColumn,
          'rounded-10': noPagination,
        })}`}
      >
        <table {...getTableProps()}>
          <TableHeader<D> headerGroups={headerGroups} columns={columns} />
          {!isLoading && (
            <TableBody<D>
              getTableBodyProps={getTableBodyProps}
              prepareRow={prepareRow}
              page={page}
            />
          )}
        </table>
      </div>

      {!isLoading && data.length === 0 && (
        <div className="text-secondary text-center my-50">No record found</div>
      )}

      {isLoading && (
        <div className="space-y-20 p-20">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="w-full h-[30px] loading-skeleton !rounded-10"
            ></div>
          ))}
        </div>
      )}
      {!noPagination && (
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
      )}
    </>
  );
};
