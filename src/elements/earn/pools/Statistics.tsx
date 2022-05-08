import { useAppSelector } from 'store';
import './Statistics.css';

export const Statistics = () => {
  const stats = useAppSelector((state) => state.bancor.statistics);

  return (
    <section className="content-block p-20">
      <div className="grid grid-cols-2 gap-20">
        {stats.map((item, i) => (
          <div key={`stats-key-${i}`}>
            <div className="flex items-end">
              <div>
                <div className="text-secondary">{item.label}</div>

                <div className="text-20 uppercase">{item.value}</div>
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
