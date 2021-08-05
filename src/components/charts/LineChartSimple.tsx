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

const sizeDefault = { width: 160, height: 31 };

interface LineChartSimpleProps {
  data: LineData[];
  seriesOptions?: DeepPartial<LineStyleOptions & SeriesOptionsCommon>;
  chartOptions?: DeepPartial<ChartOptions>;
  size?: { width: number; height: number };
}

export const LineChartSimple = ({
  data,
  seriesOptions = seriesOptDefault,
  chartOptions = chartOptDefault,
  size = sizeDefault,
}: LineChartSimpleProps) => {
  const chartDiv = createRef<HTMLDivElement>();

  useEffect(() => {
    if (!chartDiv.current) return;
    const chart = createChart(chartDiv.current, size);
    chart.applyOptions(chartOptions);
    chart.timeScale().fitContent();

    const lineSeries = chart.addLineSeries(seriesOptions);
    lineSeries.setData(data);
    return () => chart.remove();
  }, [data, seriesOptions, chartOptions, size, chartDiv]);

  return <div ref={chartDiv}></div>;
};
