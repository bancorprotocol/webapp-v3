import { Modal } from 'components/modal/Modal';
import ModalFullscreenV3 from 'components/modalFullscreen/modalFullscreenV3';
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
  onClose: Function;
  children: JSX.Element;
}) => {
  if (isMobile) {
    return (
      <ModalFullscreenV3
        title={manage ? 'Manage' : 'Select a Token'}
        setIsOpen={() => {
          if (manage) return setManage(false);
          onClose();
        }}
        className="flex flex-col px-0"
        isOpen={isOpen}
      >
        {children}
      </ModalFullscreenV3>
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
