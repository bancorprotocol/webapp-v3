import { Pool } from 'services/observables/tokens';
import { useState } from 'react';
import { SelectPoolModal } from 'components/selectPoolModal/SelectPoolModal';
import { Image } from '../image/Image';
import { ReactComponent as IconChevronDown } from 'assets/icons/chevronDown.svg';

interface SelectPoolProps {
  pool: Pool;
  pools: Pool[];
  label: string;
  onSelect: Function;
}

export const SelectPool = ({
  pool,
  pools,
  label,
  onSelect,
}: SelectPoolProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex justify-between items-center">
      <span className="font-medium">{label}</span>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center border border-blue-4 dark:border-grey-3 rounded-[16px] px-20 py-6"
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
        <IconChevronDown className="w-12 ml-10" />
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
