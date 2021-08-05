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
      {page.map((row, i) => {
        prepareRow(row);
        return (
          <tr {...row.getRowProps()}>
            {row.cells.map((cell) => {
              return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
            })}
          </tr>
        );
      })}
    </tbody>
  );
};
