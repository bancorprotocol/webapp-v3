import { useAppSelector } from 'store';
import { getProtectedPools } from 'store/bancor/pool';
import { Pool } from 'services/observables/pools';
import { useNavigation } from 'hooks/useNavigation';
import { Button } from 'components/button/Button';
import { ModalNames } from 'modals';
import { useModal } from 'hooks/useModal';

interface Props {
  buttonLabel: string;
  posGroupId?: string;
}

export const StakeRewardsBtn = ({ buttonLabel, posGroupId }: Props) => {
  const { goToPage } = useNavigation();
  const pools = useAppSelector<Pool[]>(getProtectedPools);
  const { pushModal } = useModal();

  const onSelect = (pool: Pool) => {
    if (posGroupId)
      goToPage.portfolioV2RewardsStake(pool.pool_dlt_id, posGroupId);
    else goToPage.portfolioV2RewardsStake(pool.pool_dlt_id);
  };

  return (
    <>
      <Button
        onClick={() =>
          pushModal({
            modalName: ModalNames.SelectPool,
            data: { pools, onSelect },
          })
        }
      >
        {buttonLabel}
      </Button>
    </>
  );
};
