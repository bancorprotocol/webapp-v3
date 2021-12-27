import { useState } from 'react';
import { useAppSelector } from 'redux/index';
import { Pool } from 'services/observables/tokens';
import { getProtectedPools } from 'redux/bancor/pool';
import { SelectPoolModal } from 'components/selectPoolModal/SelectPoolModal';
import { useNavigation } from 'services/router';

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
  const { pushRewardsStakeByID, pushRewardsStakeByIDnPos } = useNavigation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pools = useAppSelector<Pool[]>(getProtectedPools);

  const onSelect = (pool: Pool) => {
    if (posGroupId) pushRewardsStakeByIDnPos(pool.pool_dlt_id, posGroupId);
    else pushRewardsStakeByID(pool.pool_dlt_id);
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
