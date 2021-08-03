interface InsightCardProps {
  label: string;
  percentages: { color: string; decPercent: number }[];
}

export const InsightCard = ({ data }: { data: InsightCardProps | null }) => {
  return (
    <div className="col-span-1 flex flex-col justify-between rounded-15 p-8 border-2 border-blue-0 dark:border-blue-1">
      <div
        className={`text-12 h-[32px] font-medium ${!data ? 'opacity-30' : ''}`}
      >
        {data ? data.label : 'No available insights'}
      </div>
      <div className="h-[31px]">
        <div className="flex justify-between mb-2 h-20">
          {data &&
            data.percentages.map((p) => (
              <div key={p.color}>
                <span className={`text-${p.color}`}>
                  {(p.decPercent * 100).toFixed(1) + '%'}
                </span>
              </div>
            ))}
        </div>
        <div>
          <div
            className={`h-5 flex rounded-full bg-grey-3 ${
              !data ? 'opacity-30' : ''
            }`}
          >
            {data &&
              data.percentages.map((p, index) => (
                <div
                  key={index}
                  style={{ width: (p.decPercent * 100).toFixed(1) + '%' }}
                  className={`rounded-full bg-${p.color}`}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
