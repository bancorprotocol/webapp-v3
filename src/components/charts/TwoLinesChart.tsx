import { createRef, useEffect } from 'react';
import {
  ChartOptions,
  createChart,
  DeepPartial,
  LineData,
  LineStyleOptions,
  SeriesOptionsCommon,
} from 'lightweight-charts';

const seriesOptDefault: DeepPartial<LineStyleOptions & SeriesOptionsCommon> = {
  lineWidth: 1,
  crosshairMarkerVisible: false,
  priceLineVisible: false,
};

const chartOptDefault: DeepPartial<ChartOptions> = {
  layout: {
    backgroundColor: 'transparent',
  },
  crosshair: {
    vertLine: {
      visible: false,
    },
    horzLine: {
      visible: false,
    },
  },
  leftPriceScale: {
    visible: false,
    borderVisible: false,
  },
  rightPriceScale: {
    visible: false,
    borderVisible: false,
  },
  timeScale: {
    visible: false,
    borderVisible: false,
  },
  grid: {
    horzLines: {
      visible: false,
    },
    vertLines: {
      visible: false,
    },
  },
  handleScroll: false,
  handleScale: false,
};

const sizeDefault = { width: 160, height: 50 };

interface LineChartSimpleProps {
  data: LineData[];
  seriesOptions?: DeepPartial<LineStyleOptions & SeriesOptionsCommon>;
  chartOptions?: DeepPartial<ChartOptions>;
  color?: string;
  size?: { width: number; height: number };
}

export const TwoLinesChart = ({
  data,
  seriesOptions = seriesOptDefault,
  chartOptions = chartOptDefault,
  color,
  size = sizeDefault,
}: LineChartSimpleProps) => {
  const chartDiv = createRef<HTMLDivElement>();

  const data2 = data.map((item) => ({
    ...item,
    value: item.value * 0.9,
  }));

  useEffect(() => {
    if (!chartDiv.current) return;
    const chart = createChart(chartDiv.current, size);
    chart.applyOptions(chartOptions);
    chart.timeScale().fitContent();

    const lineSeries = chart.addLineSeries({
      ...seriesOptions,
      color: '#10BBD5',
    });
    lineSeries.setData(data);

    const lineSeries2 = chart.addLineSeries({
      ...seriesOptions,
      color: '#BFBFC3',
    });
    lineSeries2.setData(data2);
    return () => chart.remove();
  }, [data, seriesOptions, chartOptions, size, chartDiv, color, data2]);

  return <div ref={chartDiv}></div>;
};
