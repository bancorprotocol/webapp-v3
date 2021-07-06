import { ReactComponent as IconBell } from 'assets/icons/bell.svg';
import { ModalFullscreen } from 'components/modalFullscreen/ModalFullscreen';
import { useState } from 'react';

export const NotificationsMenuMobile = () => {
  const [showModal, setShowModal] = useState(false);

  const title = <div>Notifications</div>;

  return (
    <div>
      <button onClick={() => setShowModal(true)}>
        <IconBell className="w-[22px]" />
      </button>

      <ModalFullscreen
        title={title}
        setIsOpen={setShowModal}
        isOpen={showModal}
        showHeader
      >
        <div>content</div>
      </ModalFullscreen>
    </div>
  );
};
