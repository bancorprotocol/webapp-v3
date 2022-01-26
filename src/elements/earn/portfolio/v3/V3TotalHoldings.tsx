import {
  DeepPartial,
  LineData,
  LineStyleOptions,
  SeriesOptionsCommon,
} from 'lightweight-charts';
import { TwoLinesChart } from 'components/charts/TwoLinesChart';

const data = [
  {
    value: 0.000087,
    time: 34,
  },
  {
    value: 0.000087,
    time: 394,
  },
  {
    value: 0.000087,
    time: 754,
  },
  {
    value: 0.000087,
    time: 1114,
  },
  {
    value: 0.000087,
    time: 1474,
  },
  {
    value: 0.000085,
    time: 1834,
  },
  {
    value: 0.000085,
    time: 2194,
  },
  {
    value: 0.000085,
    time: 2554,
  },
  {
    value: 0.000085,
    time: 2914,
  },
  {
    value: 0.000085,
    time: 3274,
  },
  {
    value: 0.000085,
    time: 3634,
  },
  {
    value: 0.000085,
    time: 3994,
  },
  {
    value: 0.000085,
    time: 4354,
  },
  {
    value: 0.000085,
    time: 4714,
  },
  {
    value: 0.000085,
    time: 5074,
  },
  {
    value: 0.000085,
    time: 5434,
  },
  {
    value: 0.000085,
    time: 5794,
  },
  {
    value: 0.000082,
    time: 6154,
  },
  {
    value: 0.000082,
    time: 6514,
  },
  {
    value: 0.000082,
    time: 6874,
  },
  {
    value: 0.000082,
    time: 7234,
  },
  {
    value: 0.000082,
    time: 7594,
  },
  {
    value: 0.000082,
    time: 7954,
  },
  {
    value: 0.000082,
    time: 8314,
  },
  {
    value: 0.000082,
    time: 8674,
  },
  {
    value: 0.000083,
    time: 9034,
  },
  {
    value: 0.000083,
    time: 9394,
  },
  {
    value: 0.000083,
    time: 9754,
  },
  {
    value: 0.000083,
    time: 10114,
  },
  {
    value: 0.000083,
    time: 10474,
  },
  {
    value: 0.000082,
    time: 10834,
  },
  {
    value: 0.000082,
    time: 11194,
  },
  {
    value: 0.000082,
    time: 11554,
  },
  {
    value: 0.000082,
    time: 11914,
  },
  {
    value: 0.000083,
    time: 12274,
  },
  {
    value: 0.000083,
    time: 12634,
  },
  {
    value: 0.000083,
    time: 12994,
  },
  {
    value: 0.000084,
    time: 13354,
  },
  {
    value: 0.000084,
    time: 13714,
  },
  {
    value: 0.000083,
    time: 14074,
  },
  {
    value: 0.000083,
    time: 14434,
  },
  {
    value: 0.000083,
    time: 14794,
  },
  {
    value: 0.000083,
    time: 15154,
  },
  {
    value: 0.000083,
    time: 15514,
  },
  {
    value: 0.000084,
    time: 15874,
  },
  {
    value: 0.000085,
    time: 16234,
  },
  {
    value: 0.000086,
    time: 16594,
  },
  {
    value: 0.000086,
    time: 16954,
  },
  {
    value: 0.000085,
    time: 17314,
  },
  {
    value: 0.000085,
    time: 17674,
  },
  {
    value: 0.000085,
    time: 18034,
  },
  {
    value: 0.000084,
    time: 18394,
  },
  {
    value: 0.000081,
    time: 18754,
  },
  {
    value: 0.00008,
    time: 19114,
  },
  {
    value: 0.000079,
    time: 19474,
  },
  {
    value: 0.00008,
    time: 19834,
  },
  {
    value: 0.000077,
    time: 20194,
  },
  {
    value: 0.000077,
    time: 20554,
  },
  {
    value: 0.000077,
    time: 20914,
  },
  {
    value: 0.000076,
    time: 21274,
  },
  {
    value: 0.000076,
    time: 21634,
  },
  {
    value: 0.000074,
    time: 21994,
  },
  {
    value: 0.000077,
    time: 22354,
  },
  {
    value: 0.000077,
    time: 22714,
  },
  {
    value: 0.000074,
    time: 23074,
  },
  {
    value: 0.000074,
    time: 23434,
  },
  {
    value: 0.00008,
    time: 23794,
  },
  {
    value: 0.000076,
    time: 24154,
  },
  {
    value: 0.000074,
    time: 24514,
  },
  {
    value: 0.000074,
    time: 24874,
  },
  {
    value: 0.000075,
    time: 25234,
  },
  {
    value: 0.000075,
    time: 25594,
  },
  {
    value: 0.000074,
    time: 25954,
  },
  {
    value: 0.000074,
    time: 26314,
  },
  {
    value: 0.000074,
    time: 26674,
  },
  {
    value: 0.000073,
    time: 27034,
  },
  {
    value: 0.00007,
    time: 27394,
  },
  {
    value: 0.000069,
    time: 27754,
  },
  {
    value: 0.000069,
    time: 28114,
  },
  {
    value: 0.00007,
    time: 28474,
  },
  {
    value: 0.00007,
    time: 28834,
  },
  {
    value: 0.00007,
    time: 29194,
  },
  {
    value: 0.000069,
    time: 29554,
  },
  {
    value: 0.000068,
    time: 29914,
  },
  {
    value: 0.000068,
    time: 30274,
  },
  {
    value: 0.000068,
    time: 30634,
  },
  {
    value: 0.000065,
    time: 30994,
  },
  {
    value: 0.000065,
    time: 31354,
  },
  {
    value: 0.000063,
    time: 31714,
  },
  {
    value: 0.000065,
    time: 32074,
  },
  {
    value: 0.000065,
    time: 32434,
  },
  {
    value: 0.000067,
    time: 32794,
  },
  {
    value: 0.000067,
    time: 33154,
  },
  {
    value: 0.000067,
    time: 33514,
  },
  {
    value: 0.000067,
    time: 33874,
  },
  {
    value: 0.000065,
    time: 34234,
  },
  {
    value: 0.000065,
    time: 34594,
  },
  {
    value: 0.000065,
    time: 34954,
  },
  {
    value: 0.000063,
    time: 35314,
  },
  {
    value: 0.000065,
    time: 35674,
  },
  {
    value: 0.000065,
    time: 36034,
  },
  {
    value: 0.000065,
    time: 36394,
  },
  {
    value: 0.000065,
    time: 36754,
  },
  {
    value: 0.000065,
    time: 37114,
  },
  {
    value: 0.000065,
    time: 37474,
  },
  {
    value: 0.000065,
    time: 37834,
  },
  {
    value: 0.000065,
    time: 38194,
  },
  {
    value: 0.000065,
    time: 38554,
  },
  {
    value: 0.000065,
    time: 38914,
  },
  {
    value: 0.000065,
    time: 39274,
  },
  {
    value: 0.000067,
    time: 39634,
  },
  {
    value: 0.000067,
    time: 39994,
  },
  {
    value: 0.000068,
    time: 40354,
  },
  {
    value: 0.000068,
    time: 40714,
  },
  {
    value: 0.000067,
    time: 41074,
  },
  {
    value: 0.000067,
    time: 41434,
  },
  {
    value: 0.000067,
    time: 41794,
  },
  {
    value: 0.000067,
    time: 42154,
  },
  {
    value: 0.000067,
    time: 42514,
  },
  {
    value: 0.000067,
    time: 42874,
  },
  {
    value: 0.000067,
    time: 43234,
  },
  {
    value: 0.000067,
    time: 43594,
  },
  {
    value: 0.000067,
    time: 43954,
  },
  {
    value: 0.000067,
    time: 44314,
  },
  {
    value: 0.000067,
    time: 44674,
  },
  {
    value: 0.000067,
    time: 45034,
  },
  {
    value: 0.000068,
    time: 45394,
  },
  {
    value: 0.000067,
    time: 45754,
  },
  {
    value: 0.000066,
    time: 46114,
  },
  {
    value: 0.000066,
    time: 46474,
  },
  {
    value: 0.000065,
    time: 46834,
  },
  {
    value: 0.000065,
    time: 47194,
  },
  {
    value: 0.000065,
    time: 47554,
  },
  {
    value: 0.000065,
    time: 47914,
  },
  {
    value: 0.000065,
    time: 48274,
  },
  {
    value: 0.000065,
    time: 48634,
  },
  {
    value: 0.000063,
    time: 48994,
  },
  {
    value: 0.00006,
    time: 49354,
  },
  {
    value: 0.00006,
    time: 49714,
  },
  {
    value: 0.00006,
    time: 50074,
  },
  {
    value: 0.00006,
    time: 50434,
  },
  {
    value: 0.00006,
    time: 50794,
  },
  {
    value: 0.000062,
    time: 51154,
  },
  {
    value: 0.000061,
    time: 51514,
  },
  {
    value: 0.000063,
    time: 51874,
  },
  {
    value: 0.000064,
    time: 52234,
  },
  {
    value: 0.000064,
    time: 52594,
  },
  {
    value: 0.000067,
    time: 52954,
  },
  {
    value: 0.000067,
    time: 53314,
  },
  {
    value: 0.000067,
    time: 53674,
  },
  {
    value: 0.000066,
    time: 54034,
  },
  {
    value: 0.000064,
    time: 54394,
  },
  {
    value: 0.000064,
    time: 54754,
  },
  {
    value: 0.000064,
    time: 55114,
  },
  {
    value: 0.000064,
    time: 55474,
  },
  {
    value: 0.000064,
    time: 55834,
  },
  {
    value: 0.000064,
    time: 56194,
  },
  {
    value: 0.000063,
    time: 56554,
  },
  {
    value: 0.000064,
    time: 56914,
  },
  {
    value: 0.000064,
    time: 57274,
  },
  {
    value: 0.000064,
    time: 57634,
  },
  {
    value: 0.000064,
    time: 57994,
  },
  {
    value: 0.000065,
    time: 58354,
  },
  {
    value: 0.000065,
    time: 58714,
  },
  {
    value: 0.000065,
    time: 59074,
  },
  {
    value: 0.000063,
    time: 59434,
  },
  {
    value: 0.000064,
    time: 59794,
  },
  {
    value: 0.000065,
    time: 60154,
  },
  {
    value: 0.000065,
    time: 60514,
  },
] as LineData[];
const seriesOptDefault: DeepPartial<LineStyleOptions & SeriesOptionsCommon> = {
  lineWidth: 2,
  crosshairMarkerVisible: false,
  priceLineVisible: false,
};
export const V3TotalHoldings = () => {
  return (
    <section className="content-block">
      <TwoLinesChart
        data={data}
        size={{ width: 500, height: 300 }}
        seriesOptions={seriesOptDefault}
      />
    </section>
  );
};
