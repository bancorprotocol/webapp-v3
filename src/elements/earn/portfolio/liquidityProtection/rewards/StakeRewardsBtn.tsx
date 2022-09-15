import { useAppSelector } from 'store';
import { getProtectedPools } from 'store/bancor/pool';
import { Pool } from 'services/observables/pools';
import { useNavigation } from 'hooks/useNavigation';
import { Button } from 'components/button/Button';
import { useDispatch } from 'react-redux';
import { ModalNames } from 'modals';
import { pushModal } from 'store/modals/modals';

interface Props {
  buttonLabel: string;
  posGroupId?: string;
}

export const StakeRewardsBtn = ({ buttonLabel, posGroupId }: Props) => {
  const { goToPage } = useNavigation();
  const pools = useAppSelector<Pool[]>(getProtectedPools);
  const dispatch = useDispatch();

  const onSelect = (pool: Pool) => {
    if (posGroupId)
      goToPage.portfolioV2RewardsStake(pool.pool_dlt_id, posGroupId);
    else goToPage.portfolioV2RewardsStake(pool.pool_dlt_id);
  };

  return (
    <>
      <Button
        onClick={() =>
          dispatch(
            pushModal({
              modal: ModalNames.SelectPool,
              data: { pools, onSelect },
            })
          )
        }
      >
        {buttonLabel}
      </Button>
    </>
  );
};
