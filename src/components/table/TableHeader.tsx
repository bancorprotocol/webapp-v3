import { HeaderGroup } from 'react-table';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';

interface ColumnWidth {
  id: string;
  width: number | undefined;
  maxWidth: number | undefined;
  minWidth: number | undefined;
}

interface TableHeaderProps<D extends object> {
  headerGroups: HeaderGroup<D>[];
  columnsWidth: ColumnWidth[];
}

export const TableHeader = <D extends object>({
  headerGroups,
  columnsWidth,
}: TableHeaderProps<D>) => {
  const buildStyleAttr = ({ key, style }: { key: string; style: object }) => {
    const id = key.replace('header_', '');
    const widthStyles = columnsWidth.find((x) => x.id === id);
    return { id, ...widthStyles, ...style };
  };

  return (
    <thead>
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => (
            <th
              {...column.getHeaderProps(column.getSortByToggleProps())}
              style={buildStyleAttr(
                column.getHeaderProps(column.getSortByToggleProps()) as {
                  key: string;
                  style: object;
                }
              )}
            >
              {column.render('Header')}
              <span className="inline-flex">
                {column.isSorted ? (
                  <IconChevronDown
                    className={`w-10 h-6 ml-5 transition-transform duration-500 ${
                      column.isSortedDesc ? 'rotate-0' : 'rotate-180'
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
