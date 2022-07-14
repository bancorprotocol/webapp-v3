import { Modal, ModalFullscreen } from 'modals';
import { isMobile } from 'react-device-detect';

export const SearchableTokenListModal = ({
  manage,
  setManage,
  onClose,
  isOpen,
  children,
}: {
  manage: boolean;
  setManage: Function;
  isOpen: boolean;
  onClose: () => void;
  children: JSX.Element;
}) => {
  if (isMobile) {
    return (
      <ModalFullscreen
        title={manage ? 'Manage' : 'Select a Token'}
        setIsOpen={() => {
          if (manage) return setManage(false);
          onClose();
        }}
        className="flex flex-col px-0"
        isOpen={isOpen}
      >
        {children}
      </ModalFullscreen>
    );
  }

  return (
    <Modal
      title={manage ? 'Manage' : 'Select a Token'}
      isOpen={isOpen}
      setIsOpen={onClose}
      showBackButton={manage}
      onBackClick={() => setManage(false)}
    >
      {children}
    </Modal>
  );
};
