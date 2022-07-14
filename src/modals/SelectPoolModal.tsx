import { useState } from 'react';
import { isMobile } from 'react-device-detect';
import { Pool } from 'services/observables/pools';
import { InputField } from '../components/inputField/InputField';
import { Image } from 'components/image/Image';
import { Modal, ModalFullscreen } from 'modals';

export const SelectPoolModal = ({
  pools,
  isOpen,
  setIsOpen,
  onSelect,
}: {
  pools: Pool[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelect: Function;
}) => {
  const handleOnSelect = (pool: Pool) => {
    setIsOpen(false);
    onSelect(pool);
  };

  if (isMobile) {
    return (
      <ModalFullscreen
        title="Select a Pool"
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        <SelectPoolModalContent pools={pools} onSelect={handleOnSelect} />
      </ModalFullscreen>
    );
  }

  return (
    <Modal title="Select a Pool" isOpen={isOpen} setIsOpen={setIsOpen}>
      <SelectPoolModalContent pools={pools} onSelect={handleOnSelect} />
    </Modal>
  );
};

const SelectPoolModalContent = ({
  pools,
  onSelect,
}: {
  pools: Pool[];
  onSelect: (pool: Pool) => void;
}) => {
  const [search, setSearch] = useState('');
  const filteredPools = pools.filter((pool) =>
    pool.reserves[0].symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="mb-10 px-20">
        <InputField
          input={search}
          setInput={setSearch}
          placeholder="Search name"
          borderGrey
        />
      </div>
      <div className="h-full md:max-h-[calc(70vh-100px)] overflow-auto mb-20 px-20 space-y-20">
        <div className="flex justify-between text-charcoal mt-10">
          <span>Pools</span>
          <span>APR</span>
        </div>
        {filteredPools.map((pool) => (
          <button
            key={pool.pool_dlt_id}
            onClick={() => onSelect(pool)}
            className="flex justify-between items-center w-full"
          >
            <span className="flex items-center">
              <Image
                src={pool.reserves[0].logoURI.replace('thumb', 'small')}
                alt="Token Logo"
                className="!rounded-full w-24 h-24 z-20"
              />
              <Image
                src={pool.reserves[1].logoURI.replace('thumb', 'small')}
                alt="Token Logo"
                className="-ml-10 !rounded-full w-24 h-24 z-10"
              />
              <span className="ml-10">{pool.name}</span>
            </span>
            <span className="text-12">{pool.apr_7d.toFixed(2)}%</span>
          </button>
        ))}
      </div>
    </>
  );
};
