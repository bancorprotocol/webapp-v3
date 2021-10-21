import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import { useAppSelector } from 'redux/index';
import { Pool } from 'services/observables/tokens';
import { getPools } from 'redux/bancor/pool';
import { SelectPoolModal } from 'components/selectPoolModal/SelectPoolModal';

interface Props {
  buttonLabel: string;
  buttonClass: string;
}

export const StakeRewardsBtn = ({ buttonClass, buttonLabel }: Props) => {
  const history = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pools = useAppSelector<Pool[]>(getPools);

  const onSelect = (pool: Pool) => {
    history.push(`/portfolio/rewards/stake/${pool.pool_dlt_id}`);
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
