import { useAppSelector } from 'store';
import './Statistics.css';

export const Statistics = () => {
  const stats = useAppSelector((state) => state.bancor.statistics);
  const first = stats[0];

  return (
    <section className="content-block p-20">
      {!stats.length ? (
        [...Array(4)].map((_, i) => (
          <div key={`stats-loading-key-${i}`}>
            <div className="loading-skeleton w-1/2 h-20 mx-auto mb-10"></div>
            <div className="loading-skeleton w-2/3 h-14 mx-auto"></div>
          </div>
        ))
      ) : (
        <div>
          <div className="flex items-end">
            <div>
              <div className="text-secondary mb-15">{first.label}</div>
              <div className="text-[30px] text-black-medium dark:text-white-medium uppercase">
                {first.value}
              </div>
            </div>
          </div>
          <hr className="border-fog dark:border-grey my-20" />
          <div className="grid grid-cols-2 gap-20">
            {stats.slice(1).map((item, i) => (
              <div key={`stats-key-${i}`}>
                <div className="flex items-end">
                  <div>
                    <div className="text-secondary">{item.label}</div>
                    <div className="text-20 text-black-medium dark:text-white-medium uppercase">
                      {item.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
