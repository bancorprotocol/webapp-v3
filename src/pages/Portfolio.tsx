import { MyStake } from 'elements/earn/portfolio/MyStake';
import { MyRewards } from 'elements/earn/portfolio/MyRewards';

export const Portfolio = () => {
  return (
    <div className="space-y-30 max-w-[1140px] mx-auto bg-grey-1 dark:bg-blue-3">
      <h1>Portfolio</h1>
      <p>
        Manage your protected positions in Bancor pools and track and analyze
        your returns.
      </p>
      <div className="grid xl:grid-cols-2 gap-40">
        <MyStake />
        <MyRewards />
      </div>
    </div>
  );
};
