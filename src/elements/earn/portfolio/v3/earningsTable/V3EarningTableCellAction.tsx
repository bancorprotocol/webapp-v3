import { ReactComponent as IconMenuDots } from 'assets/icons/menu-dots.svg';

interface Props {
  setIsWithdrawModalOpen: (isOpen: boolean) => void;
}

export const V3EarningTableCellAction = ({ setIsWithdrawModalOpen }: Props) => {
  return (
    <button onClick={() => setIsWithdrawModalOpen(true)}>
      <IconMenuDots className="w-20" />
    </button>
  );
};
