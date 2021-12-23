import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import { useAppSelector } from 'redux/index';
import { Pool } from 'services/observables/tokens';
import { getProtectedPools } from 'redux/bancor/pool';
import { SelectPoolModal } from 'components/selectPoolModal/SelectPoolModal';
import {
  portfolioRewardsStakeByID,
  portfolioRewardsStakeByIDnPos,
  push,
} from 'utils/router';

interface Props {
  buttonLabel: string;
  buttonClass: string;
  posGroupId?: string;
}

export const StakeRewardsBtn = ({
  buttonClass,
  buttonLabel,
  posGroupId,
}: Props) => {
  const history = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pools = useAppSelector<Pool[]>(getProtectedPools);

  const onSelect = (pool: Pool) => {
    if (posGroupId)
      push(
        portfolioRewardsStakeByIDnPos(pool.pool_dlt_id, posGroupId),
        history
      );
    else push(portfolioRewardsStakeByID(pool.pool_dlt_id), history);
  };

  return (
    <>
      <SelectPoolModal
        pools={pools}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSelect={onSelect}
      />
      <button onClick={() => setIsModalOpen(true)} className={buttonClass}>
        {buttonLabel}
      </button>
    </>
  );
};
