import { UsePaginationInstanceProps } from 'react-table';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';

interface TablePaginationProps
  extends Omit<UsePaginationInstanceProps<never>, 'page'> {
  pageIndex: number;
  pageSize: number;
}

export const TablePagination = ({
  gotoPage,
  previousPage,
  canPreviousPage,
  nextPage,
  canNextPage,
  pageCount,
  pageOptions,
  setPageSize,
  pageIndex,
  pageSize,
}: TablePaginationProps) => {
  const showResults = [10, 20, 30, 40, 50];
  return (
    <div className="flex justify-center md:justify-between items-center p-20 text-grey-3 text-12">
      <div className="hidden md:flex justify-between items-center  space-x-10">
        <span>Show</span>
        <div className="px-10 py-5 border border-grey-2 dark:border-grey-3 rounded-[14px]">
          <select
            className="outline-none dark:bg-blue-4"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {showResults.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </div>
        <span>Results</span>
      </div>
      <div className="flex justify-between items-center space-x-10">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          First
        </button>
        <button
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          className="px-5 py-10"
        >
          <IconChevronDown
            className={`w-10 h-6 transition-transform duration-500 rotate-90`}
          />
        </button>
        <div className="px-10 py-5 border border-grey-2 dark:border-grey-3 rounded-[14px]">
          <input
            className="dark:bg-blue-4"
            type="text"
            value={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: '20px' }}
          />
          / {pageOptions.length}
        </div>
        <button
          onClick={() => nextPage()}
          disabled={!canNextPage}
          className="px-5 py-10"
        >
          <IconChevronDown className={`w-10 h-6 rotate-[270deg]`} />
        </button>
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          Last
        </button>
      </div>
    </div>
  );
};
