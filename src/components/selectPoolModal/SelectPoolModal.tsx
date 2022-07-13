import { isMobile } from 'react-device-detect';
import { Modal } from '../modal/Modal';
import { SelectPoolModalContent } from './SelectPoolModalContent';
import { Pool } from 'services/observables/pools';
import ModalFullscreenV3 from 'components/modalFullscreen/modalFullscreenV3';

interface Props {
  pools: Pool[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelect: Function;
}

export const SelectPoolModal = ({
  pools,
  isOpen,
  setIsOpen,
  onSelect,
}: Props) => {
  const handleOnSelect = (pool: Pool) => {
    setIsOpen(false);
    onSelect(pool);
  };

  if (isMobile) {
    return (
      <ModalFullscreenV3
        title="Select a Pool"
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        <SelectPoolModalContent pools={pools} onSelect={handleOnSelect} />
      </ModalFullscreenV3>
    );
  }

  return (
    <Modal title="Select a Pool" isOpen={isOpen} setIsOpen={setIsOpen}>
      <SelectPoolModalContent pools={pools} onSelect={handleOnSelect} />
    </Modal>
  );
};
