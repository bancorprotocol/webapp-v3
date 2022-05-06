import { useState } from 'react';
import { useAppSelector } from 'store';
import { getProtectedPools } from 'store/bancor/pool';
import { SelectPoolModal } from 'components/selectPoolModal/SelectPoolModal';
import { Pool } from 'services/observables/pools';
import { usePages } from 'pages/Router';

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
  const { goToPage } = usePages();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pools = useAppSelector<Pool[]>(getProtectedPools);

  const onSelect = (pool: Pool) => {
    if (posGroupId)
      goToPage.portfolioV2RewardsStake(pool.pool_dlt_id, posGroupId);
    else goToPage.portfolioV2RewardsStake(pool.pool_dlt_id);
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
