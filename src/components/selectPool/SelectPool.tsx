import { Pool } from 'services/observables/tokens';
import { useState } from 'react';
import { SelectPoolModal } from 'components/selectPoolModal/SelectPoolModal';
import { Image } from '../image/Image';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';

interface Props {
  pool: Pool;
  pools: Pool[];
  onSelect: Function;
}

export const SelectPool = ({ pool, pools, onSelect }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <span>Stake in Pool</span>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center border border-blue-4 rounded-[16px] px-10 py-6"
      >
        <Image
          src={pool.reserves[0].logoURI.replace('thumb', 'small')}
          alt="Token Logo"
          className="bg-grey-1 rounded-full w-24 h-24 z-20"
        />
        <Image
          src={pool.reserves[1].logoURI.replace('thumb', 'small')}
          alt="Token Logo"
          className="-ml-10 bg-grey-1 rounded-full w-24 h-24 z-10"
        />
        <span className="ml-10">{pool.name}</span>
        <IconChevronDown className="w-12 mx-10" />
      </button>
      <SelectPoolModal
        pools={pools}
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        onSelect={onSelect}
      />
    </div>
  );
};
