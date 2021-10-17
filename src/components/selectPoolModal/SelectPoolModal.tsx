import { Pool } from 'services/observables/tokens';
import { isMobile } from 'react-device-detect';
import { ModalFullscreen } from '../modalFullscreen/ModalFullscreen';
import { Modal } from '../modal/Modal';
import { SelectPoolModalContent } from './SelectPoolModalContent';

interface Props {
  pools: Pool[];
  isOpen: boolean;
  setIsOpen: Function;
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
      <ModalFullscreen
        title="Select a Pool"
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        showHeader
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
