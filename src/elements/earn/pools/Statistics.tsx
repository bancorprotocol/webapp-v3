import { ReactComponent as IconArrow } from 'assets/icons/arrow.svg';
import { useAppSelector } from 'redux/index';
import { Statistic } from 'services/observables/statistics';

export const Statistics = () => {
  const stats = useAppSelector<Statistic[]>((state) => state.bancor.statistics);

  return (
    <section className="content-section py-20 md:mt-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-20">
        {stats.map((item, index) => (
          <div key={index} className="flex justify-center">
            <div className="flex items-end">
              {item.change24h && (
                <div className="mb-10 animate-bounce">
                  <IconArrow
                    className={`w-16 mr-14 lg:mt-0 ${
                      item.change24h > 0
                        ? 'text-success'
                        : 'text-error rotate-180'
                    }`}
                  />
                </div>
              )}
              <div className="text-center lg:text-left">
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
      </div>
    </section>
  );
};
