import { TokenMinimal } from 'services/observables/tokens';
import { Button, ButtonSize } from 'components/button/Button';
import { Image } from 'components/image/Image';
import { Modal, ModalNames } from 'modals';
import { useModal } from 'hooks/useModal';
import { useAppSelector } from 'store';
import { getIsModalOpen, getModalData } from 'store/modals/modals';

interface ApproveModalProps {
  token: TokenMinimal;
  amount: string;
  isLoading: boolean;
  approve: (amount?: string) => void;
}

export const ApproveModal = () => {
  const { popModal } = useModal();
  const isOpen = useAppSelector((state) =>
    getIsModalOpen(state, ModalNames.ApproveModal)
  );
  const props = useAppSelector<ApproveModalProps | undefined>((state) =>
    getModalData(state, ModalNames.ApproveModal)
  );

  if (!props) return null;

  const { token, amount, isLoading, approve } = props;

  return (
    <Modal setIsOpen={popModal} isOpen={isOpen}>
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
            onClick={() => approve()}
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
            onClick={() => approve(amount)}
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
