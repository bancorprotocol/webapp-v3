import { Modal } from 'components/modal/Modal';
import { Token } from 'services/observables/tokens';
import { Button, ButtonSize } from 'components/button/Button';
import { Image } from 'components/image/Image';

export const ModalApproveNew = ({
  isOpen,
  setIsOpen,
  setApproval,
  token,
  amount,
  isLoading,
  onClose,
}: {
  isOpen: boolean;
  setIsOpen: Function;
  setApproval: Function;
  token: Token;
  amount: string;
  isLoading: boolean;
  onClose?: Function;
}) => {
  return (
    <Modal
      onClose={() => {
        if (onClose) onClose();
        setIsOpen(false);
      }}
      setIsOpen={setIsOpen}
      isOpen={isOpen}
    >
      <div className="px-30 py-10">
        <div className="flex flex-col items-center text-12 mb-20">
          <div className="flex justify-center items-center mb-14">
            <Image
              alt={'Token Logo'}
              src={token.logoURI}
              className={'w-[52px] h-[52px] rounded-full'}
            />
          </div>
          <h2 className="text-20 mb-8">Approve {token.symbol}</h2>
          <p className="text-center text-graphite">
            Before you can proceed, you need to approve {token.symbol} spending.
          </p>
          <Button
            onClick={() => setApproval()}
            size={ButtonSize.Full}
            className="my-15"
            disabled={isLoading}
          >
            {isLoading ? 'waiting for confirmation' : 'Approve'}
          </Button>
          <p className="text-center text-graphite">
            Want to approve before each transaction?
          </p>
          <button
            onClick={() => setApproval(amount)}
            className="underline"
            disabled={isLoading}
          >
            Approve limited permission
          </button>
        </div>
      </div>
    </Modal>
  );
};
