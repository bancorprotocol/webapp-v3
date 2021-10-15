import { Pool } from 'services/observables/tokens';

interface Props {
  pool: Pool;
  account?: string | null;
}

export const RewardsStakeCTA = ({ pool, account }: Props) => {
  return (
    <button className="btn-primary w-full rounded mt-10">
      Stake and Protect
    </button>
  );
};
