import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useAppSelector } from 'store';
import { setMigrationDisabledLS } from 'utils/localStorage';
import { openNewTab } from 'utils/pureFunctions';
import { Modal } from './modal/Modal';

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  description: string;
  learnMore?: string;
  buttonText?: string;
};

export const WarningModal = ({
  isOpen,
  setIsOpen,
  title,
  description,
  learnMore,
  buttonText = 'I understand',
}: Props) => {
  const account = useAppSelector((state) => state.user.account);

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen} title={title}>
      <div className="flex justify-center items-center">
        <div className="content-block rounded-40 p-20 flex flex-col items-center text-center gap-20">
          <p className="text-secondary">{description}</p>
          <Button
            onClick={() => {
              setIsOpen(false);
              setMigrationDisabledLS(account);
            }}
            variant={ButtonVariant.Secondary}
            size={ButtonSize.Full}
          >
            {buttonText}
          </Button>
          <Button
            onClick={() => {
              openNewTab(learnMore);
            }}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Full}
          >
            Learn more
          </Button>
        </div>
      </div>
    </Modal>
  );
};
