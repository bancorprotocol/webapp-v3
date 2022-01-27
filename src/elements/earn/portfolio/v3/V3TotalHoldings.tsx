import { HoldingsChart } from 'components/charts/HoldingsChart';

const periods = ['1w', '1m', 'ytd', '1y', 'all'];

export const V3TotalHoldings = () => {
  return (
    <section className="content-block">
      <div className="flex justify-between p-30 pb-0">
        <div className="">
          <span className="text-graphite">Total Holdings</span>
          <h2 className="text-[30px] font-normal my-10">$29.000</h2>
          <span className="text-primary text-16">+ $15.182 | +132%</span>
        </div>
        <div className="space-x-14">
          {periods.map((period, i) => (
            <button
              key={i}
              className={`h-[26px] px-10 rounded-full ${
                i === 3 ? 'bg-fog' : 'text-graphite'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <HoldingsChart />

      <div className="text-graphite flex justify-between p-30 py-20">
        <div className="space-x-5">
          <span className="text-primary font-semibold">Value</span>
          <span>vs</span>
          <span className="font-semibold">HODLE</span>
        </div>

        <div>Last updated 12:20</div>
      </div>
    </section>
  );
};
