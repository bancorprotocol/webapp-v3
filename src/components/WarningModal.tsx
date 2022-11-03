import { ReactComponent as WarningIcon } from 'assets/icons/warning.svg';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { Navigate } from 'components/navigate/Navigate';
import { setMigrationDisabledLS } from 'utils/localStorage';
import { Modal } from './modal/Modal';

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
  description: string;
  hrefText?: string;
  href?: string;
  buttonText?: string;
};

export const WarningModal = ({
  isOpen,
  setIsOpen,
  title,
  description,
  href,
  hrefText,
  buttonText = 'Confirm',
}: Props) => {
  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      <div className="flex justify-center items-center">
        <div className="content-block rounded-40 p-20 flex flex-col items-center text-center">
          <WarningIcon className="w-40 h-40 text-error" />
          <h1 className="mt-20 mb-10">{title}</h1>
          <p className="text-secondary mb-20">{description}</p>
          {href && (
            <Navigate className="underline mb-20" to={href}>
              {hrefText}
            </Navigate>
          )}
          <Button
            onClick={() => {
              setIsOpen(false);
              setMigrationDisabledLS(true);
            }}
            variant={ButtonVariant.Tertiary}
            size={ButtonSize.Full}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
