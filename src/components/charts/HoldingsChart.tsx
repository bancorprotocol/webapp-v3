import {
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartDataset,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  ScatterDataPoint,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import faker from '@faker-js/faker';
import { DeepPartial } from 'chart.js/types/utils';
import colors from 'styles/plugins/colors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const options: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    xAxis: {
      display: false,
    },
    yAxis: {
      display: false,
    },
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      position: 'nearest',
      mode: 'x',
      yAlign: 'bottom',
      intersect: false,
    },
  },
};

const labels = [...Array(100)].map(() => faker.date.month());
const test = labels.map(() => faker.datatype.number({ min: 100, max: 130 }));
test[test.length - 1] = 300;
test[test.length - 2] = 310;

const datasetOptions: DeepPartial<
  ChartDataset<'line', (number | ScatterDataPoint | null)[]>
> = {
  tension: 0.3,
  pointBorderWidth: 0,
  pointStyle: 'line',
};

const data: ChartData<'line'> = {
  labels,
  datasets: [
    {
      ...datasetOptions,
      label: 'Value',
      data: test.map((x, i) => x + i * 0.5),
      borderColor: colors.primary.DEFAULT,
      //backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
    {
      ...datasetOptions,
      label: 'HODL',
      data: test,
      borderColor: colors.graphite.DEFAULT,
      //backgroundColor: 'rgba(53, 162, 235, 0.5)',
    },
  ],
};
export const HoldingsChart = () => {
  return (
    <div className="h-[200px]">
      <Line options={options} data={data} />
    </div>
  );
};
