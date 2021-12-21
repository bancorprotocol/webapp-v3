import { ComponentStory, ComponentMeta } from '@storybook/react';
import { withDesign } from 'storybook-addon-designs';
import { DataTable, TableColumn } from './DataTable';
import { useMemo } from 'react';
import { Token } from '../../services/observables/tokens';
import { SortingRule } from 'react-table';

export default {
  title: 'Components/Tables',
  component: DataTable,
  decorators: [withDesign],
} as ComponentMeta<typeof DataTable>;

interface SampleData {
  name: string;
  symbol: string;
  price: number;
  liquidity: number;
  volume: number;
}

const data: SampleData[] = [
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 8500,
    liquidity: 1000000,
    volume: 500000,
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 8500,
    liquidity: 1000000,
    volume: 500000,
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 8500,
    liquidity: 1000000,
    volume: 500000,
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 8500,
    liquidity: 1000000,
    volume: 500000,
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 8500,
    liquidity: 1000000,
    volume: 500000,
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 8500,
    liquidity: 1000000,
    volume: 500000,
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: 8500,
    liquidity: 1000000,
    volume: 500000,
  },
];

const Template: ComponentStory<typeof DataTable> = (args) => {
  const columns = useMemo<TableColumn<SampleData>[]>(
    () => [
      {
        id: 'name',
        Header: 'Name',
        accessor: 'name',
        Cell: (cellData) => cellData.value,
      },
      {
        id: 'symbol',
        Header: 'Symbol',
        accessor: 'symbol',
        Cell: (cellData) => cellData.value,
      },
      {
        id: 'price',
        Header: 'Price',
        accessor: 'price',
        Cell: (cellData) => cellData.value,
      },
      {
        id: 'liquidity',
        Header: 'Liquidity',
        accessor: 'liquidity',
        Cell: (cellData) => cellData.value,
      },
      {
        id: 'volume',
        Header: 'Volume',
        accessor: 'volume',
        Cell: (cellData) => cellData.value,
      },
    ],
    []
  );
  const defaultSort: SortingRule<Token> = { id: 'liquidity', desc: true };

  return (
    <section className="content-section pt-20 pb-10">
      <h2 className="mb-20 ml-20">Data Table</h2>

      <DataTable<SampleData>
        {...args}
        data={data}
        columns={columns}
        defaultSort={defaultSort}
      />
    </section>
  );
};

export const TableMain = Template.bind({});

TableMain.args = {
  isLoading: false,
  stickyColumn: false,
};

TableMain.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/fwADI9wqDrRAdlMX8EddCw/Bancor-v3?node-id=7879%3A257081',
  },
};
