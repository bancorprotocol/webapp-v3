import { HeaderGroup } from 'react-table';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';
import { TableColumn } from 'components/table/DataTable';
import { InfoTooltip } from 'components/tooltip/InfoTooltip';

interface ColumnWidth {
  id: string;
  width: number | undefined;
  maxWidth: number | undefined;
  minWidth: number | undefined;
}

interface TableHeaderProps<D extends object> {
  headerGroups: HeaderGroup<D>[];
  columns: TableColumn<D>[];
}

export const TableHeader = <D extends object>({
  headerGroups,
  columns,
}: TableHeaderProps<D>) => {
  const columnWidths: ColumnWidth[] = columns.map((c) => {
    return {
      id: c.id as string,
      width: c.width as number | undefined,
      maxWidth: c.maxWidth as number | undefined,
      minWidth: c.minWidth as number | undefined,
    };
  });

  const getStyleAttr = ({ key, style }: { key: string; style: object }) => {
    const id = key.replace('header_', '');
    const widthStyles = columnWidths.find((x) => x.id === id);
    return { id, ...widthStyles, ...style };
  };

  const tooltips = columns.map((c) => {
    return { id: c.id, tooltip: c.tooltip };
  });

  const getTooltip = (key: string) => {
    const id = key.replace('header_', '');
    const found = tooltips.find((x) => x.id === id && x.tooltip);
    if (found && found.tooltip)
      return (
        <span className="inline-flex ml-5">
          <InfoTooltip text={found.tooltip} />
        </span>
      );
  };

  const getSortBy = (isSorted: boolean, isSortedDesc?: boolean) => {
    return (
      <span className="inline-flex relative">
        {isSorted && (
          <IconChevronDown
            className={`absolute bottom-[1px] w-10 h-6 ml-5 transition-transform duration-500 ${
              isSortedDesc ? 'rotate-0' : 'rotate-180'
            }`}
          />
        )}
      </span>
    );
  };

  return (
    <thead>
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => (
            <th
              {...column.getHeaderProps(column.getSortByToggleProps())}
              style={getStyleAttr(
                column.getHeaderProps(column.getSortByToggleProps()) as {
                  key: string;
                  style: object;
                }
              )}
              title={undefined}
            >
              {column.render('Header')}
              {getTooltip(column.getHeaderProps().key as string)}
              {getSortBy(column.isSorted, column.isSortedDesc)}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );
};
