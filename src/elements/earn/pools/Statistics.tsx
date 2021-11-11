import { ReactComponent as IconArrow } from 'assets/icons/arrow.svg';
import { useAppSelector } from 'redux/index';
import { Statistic } from 'services/observables/statistics';
import './Statistics.css';

export const Statistics = () => {
  const stats = useAppSelector<Statistic[]>((state) => state.pool.statistics);

  return (
    <section className="content-section py-20 pl-30 lg:pl-0 md:mt-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-20">
        {stats.map((item, i) => (
          <div key={`stats-key-${i}`} className="flex lg:justify-center">
            <div className="flex items-end">
              {item.change24h && (
                <div
                  className={`mb-10 lg:mb-5 ${
                    item.change24h > 0
                      ? 'animate-bounce-2s'
                      : 'animate-bounce-2s-invert'
                  }`}
                >
                  <IconArrow
                    className={`w-16 mr-14 ${
                      item.change24h > 0
                        ? 'text-success'
                        : 'text-error rotate-180'
                    }`}
                  />
                </div>
              )}
              <div>
                {item.change24h && (
                  <span
                    className={`lg:hidden text-14 font-normal ${
                      item.change24h > 0 ? 'text-success' : 'text-error'
                    }`}
                  >
                    {item.change24h.toFixed(2)}%
                  </span>
                )}

                <div className="text-20 font-bold uppercase">
                  {item.value}
                  {item.change24h && (
                    <span
                      className={`hidden lg:inline-block text-14 font-normal ml-10 ${
                        item.change24h > 0 ? 'text-success' : 'text-error'
                      }`}
                    >
                      {item.change24h.toFixed(2)}%
                    </span>
                  )}
                </div>
                {item.label}
              </div>
            </div>
          </div>
        ))}
        {!stats.length &&
          [...Array(4)].map((_, i) => (
            <div key={`stats-loading-key-${i}`}>
              <div className="loading-skeleton w-1/2 h-20 mx-auto mb-10"></div>
              <div className="loading-skeleton w-2/3 h-14 mx-auto"></div>
            </div>
          ))}
      </div>
    </section>
  );
};
