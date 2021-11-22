import { Pool } from 'services/observables/tokens';

interface Props {
  pool: Pool;
  claimableAmount: string | null;
}

export const RewardsStakeAmount = ({ claimableAmount }: Props) => {
  return <div>claimable amount: {claimableAmount}</div>;
};
