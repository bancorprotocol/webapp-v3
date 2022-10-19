import { Holding } from 'store/portfolio/v3Portfolio.types';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useModal } from 'hooks/useModal';
import { ModalNames } from 'modals';

export const V3HoldingsItemWithdraw = ({ holding }: { holding: Holding }) => {
  const { pool } = holding;
  const { pushModal } = useModal();

  const isDisabled = toBigNumber(holding.tokenBalance).isZero();

  return (
    <>
      <div>
        <div className="text-secondary">Withdrawal</div>
        <div className={`mt-6 mb-10 ${isDisabled ? 'text-secondary' : ''}`}>
          {prettifyNumber(holding.tokenBalance)} {pool.reserveToken.symbol}
        </div>
        <div className="flex justify-center">
          <Button
            variant={ButtonVariant.Secondary}
            size={ButtonSize.ExtraSmall}
            disabled={isDisabled}
            onClick={() =>
              pushModal({
                modalName: ModalNames.V3Withdraw,
                data: { holding },
              })
            }
          >
            Withdraw
          </Button>
        </div>
      </div>
    </>
  );
};
