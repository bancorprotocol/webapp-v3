import { useAppSelector } from 'store';

export const AdminStandardRewardsData = () => {
  const programs = useAppSelector((state) => state.bancor.allStandardRewardsV3);

  return (
    <>
      <h2 className="pb-20 text-primary">Standard Rewards Database</h2>

      <div>
        <div className={'text-left'}>
          {programs.map((p) => (
            <pre key={p.id}>{JSON.stringify(p, null, 2)}</pre>
          ))}
        </div>
      </div>
    </>
  );
};
