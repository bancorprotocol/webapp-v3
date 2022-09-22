import { Modal, ModalNames } from 'modals';
import { useMemo, useState } from 'react';
import { ContractsApi } from 'services/web3/v3/contractsApi';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';
import { ExternalHolding } from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings.types';
import { useAppSelector } from 'store';
import { useDispatch } from 'react-redux';
import { Button, ButtonSize } from 'components/button/Button';
import { TokenBalance } from 'components/tokenBalance/TokenBalance';
import { useApproveModal } from 'hooks/useApproveModal';
import { mockToken } from 'utils/mocked';
import { getMigrateFnByAmmProvider } from 'elements/earn/portfolio/v3/externalHoldings/externalHoldings';
import { shrinkToken } from 'utils/formulas';
import { getIsModalOpen, getModalData, popModal } from 'store/modals/modals';

interface V3ExternalHoldingsProps {
  position: ExternalHolding;
}
export const V3ExternalHoldingsModal = () => {
  const [txBusy, setTxBusy] = useState(false);
  const account = useAppSelector((state) => state.user.account);
  const dispatch = useDispatch();
  const isOpen = useAppSelector((state) =>
    getIsModalOpen(state, ModalNames.V3ExternalHoldings)
  );

  const props = useAppSelector<V3ExternalHoldingsProps | undefined>((state) =>
    getModalData(state, ModalNames.V3ExternalHoldings)
  );

  const onClose = () => {
    dispatch(popModal(ModalNames.V3ExternalHoldings));
  };

  const { withdrawalFee, lockDuration } = useAppSelector(
    (state) => state.v3Portfolio.withdrawalSettings
  );

  const lockDurationInDays = useMemo(
    () => lockDuration / 60 / 60 / 24,
    [lockDuration]
  );

  const withdrawalFeeInPercent = useMemo(
    () => (withdrawalFee * 100).toFixed(2),
    [withdrawalFee]
  );

  const tokensToApprove = useMemo(
    () => [
      {
        token: {
          ...mockToken,
          address: props?.position.poolTokenAddress ?? '',
          symbol: 'lpTKN',
        },
        amount: shrinkToken(props?.position.poolTokenBalanceWei ?? '0', 18),
      },
    ],
    [props?.position.poolTokenAddress, props?.position.poolTokenBalanceWei]
  );

  const migrate = async () => {
    if (!account) {
      console.error('No account found, please login');
      return;
    }

    const migrateFn = getMigrateFnByAmmProvider(position.ammKey);
    if (!migrateFn) {
      console.error('getMigrateFnByAmmProvider returned undefined');
      return;
    }

    try {
      const res = await migrateFn(
        position.tokens[0].address,
        position.tokens[1].address,
        position.poolTokenBalanceWei
      );
      await res.wait();
      onClose();
      await updatePortfolioData(dispatch);
    } catch (e) {
      console.error(e);
    } finally {
      setTxBusy(false);
    }
  };

  const [onStart, ApproveModal] = useApproveModal(
    tokensToApprove,
    migrate,
    ContractsApi.BancorPortal.contractAddress
  );

  if (!props) return null;
  const { position } = props;

  const handleButtonClick = async () => {
    setTxBusy(true);
    onStart();
  };

  return (
    <Modal title={'Migrate'} setIsOpen={onClose} isOpen={isOpen} large>
      <div className="p-30 pt-0">
        <h2 className="text-[24px] leading-9">
          Protect this {position.ammName} holding from impermanent loss
        </h2>

        <p className="mt-16 mb-20 text-secondary">
          {position.rektStatus === 'At risk'
            ? 'Your position is at risk of impermanent loss'
            : `You’ve lost ${position.rektStatus} in impermanent loss so far`}
          , get protected on Bancor.
        </p>

        <h3 className="mb-10">Moving to Bancor</h3>

        <div className="bg-fog dark:bg-grey p-20 rounded space-y-20">
          {position.tokens.map((t) => (
            <div key={t.address}>
              <TokenBalance
                symbol={t.symbol}
                amount={t.balance || '0'}
                usdPrice={t.usdPrice}
                imgUrl={t.logoURI}
              />
            </div>
          ))}
        </div>

        <Button
          onClick={handleButtonClick}
          size={ButtonSize.Full}
          className="mt-20"
          disabled={txBusy}
        >
          {txBusy ? '... waiting for confirmation' : 'Migrate and Protect'}
        </Button>

        <p className="text-secondary text-center mt-10">
          {lockDurationInDays} day cooldown • {withdrawalFeeInPercent}%
          withdrawal fee
        </p>

        {ApproveModal}
      </div>
    </Modal>
  );
};
