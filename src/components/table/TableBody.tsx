import { UsePaginationInstanceProps, UseTableInstanceProps } from 'react-table';

interface TableBodyProps<D extends object> {
  getTableBodyProps: UseTableInstanceProps<D>['getTableBodyProps'];
  prepareRow: UseTableInstanceProps<D>['prepareRow'];
  page: UsePaginationInstanceProps<D>['page'];
}

export const TableBody = <D extends object>({
  getTableBodyProps,
  prepareRow,
  page,
}: TableBodyProps<D>) => {
  return (
    <tbody {...getTableBodyProps()}>
      {page.map((row) => {
        prepareRow(row);
        return (
          <tr {...row.getRowProps()} className="group">
            {row.cells.map((cell) => {
              return (
                <td
                  {...cell.getCellProps()}
                  className={`${
                    row.isExpanded ? '!bg-primary dark:!bg-grey' : ''
                  } group-hover:bg-primary dark:group-hover:bg-grey`}
                >
                  {cell.render('Cell')}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
};
