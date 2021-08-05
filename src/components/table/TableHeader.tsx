import { HeaderGroup } from 'react-table';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';

interface TableHeaderProps<D extends object> {
  headerGroups: HeaderGroup<D>[];
}

export const TableHeader = <D extends object>({
  headerGroups,
}: TableHeaderProps<D>) => {
  return (
    <thead>
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => (
            <th {...column.getHeaderProps(column.getSortByToggleProps())}>
              {column.render('Header')}
              <span className="inline-flex">
                {column.isSorted ? (
                  <IconChevronDown
                    className={`w-10 h-6 ml-5 transition-transform duration-500 ${
                      column.isSortedDesc ? 'rotate-180' : 'rotate-0'
                    }`}
                  />
                ) : (
                  ''
                )}
              </span>
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
};
