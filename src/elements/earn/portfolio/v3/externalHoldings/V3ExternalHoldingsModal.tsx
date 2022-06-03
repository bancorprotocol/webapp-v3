import { Modal } from 'components/modal/Modal';
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
import { ProtectedSettingsV3 } from 'components/protectedSettingsV3/ProtectedSettingsV3';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { TokenMinimal } from 'services/observables/tokens';
import { Image } from 'components/image/Image';
import {
  confirmMigrateExtHoldingNotification,
  failedNotification,
  rejectNotification,
} from 'services/notifications/notifications';
import { ErrorCode } from 'services/web3/types';

interface Props {
  position: ExternalHolding;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  nonBancorToken?: TokenMinimal;
}

export const V3ExternalHoldingsModal = ({
  position,
  isOpen,
  setIsOpen,
  nonBancorToken,
}: Props) => {
  const [txBusy, setTxBusy] = useState(false);
  const account = useAppSelector((state) => state.user.account);
  const dispatch = useDispatch();

  const tokensToApprove = useMemo(
    () => [
      {
        token: {
          ...mockToken,
          address: position.poolTokenAddress,
          symbol: position.name,
        },
        amount: shrinkToken(position.poolTokenBalanceWei, 18),
      },
    ],
    [position.name, position.poolTokenAddress, position.poolTokenBalanceWei]
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
      const tx = await migrateFn(
        position.tokens[0].address,
        position.tokens[1]?.address ?? position.nonBancorToken?.tokenAddress,
        position.poolTokenBalanceWei
      );
      setIsOpen(false);
      confirmMigrateExtHoldingNotification(dispatch, tx.hash, position.name);
      await tx.wait();
      await updatePortfolioData(dispatch);
    } catch (e: any) {
      console.error('failed to migrate position', e);
      if (e.code === ErrorCode.DeniedTx) {
        rejectNotification(dispatch);
      } else {
        failedNotification(dispatch, 'Migration Failed');
      }
      setIsOpen(false);
    } finally {
      setTxBusy(false);
    }
  };

  const [onStart, ApproveModal] = useApproveModal(
    tokensToApprove,
    migrate,
    ContractsApi.BancorPortal.contractAddress
  );

  const handleButtonClick = async () => {
    setTxBusy(true);
    onStart();
  };

  return (
    <Modal title={'Migrate'} setIsOpen={setIsOpen} isOpen={isOpen} large>
      <div className="px-20 pb-10">
        <div className="px-20">
          <h2 className="text-[24px] leading-9">
            Protect this {position.ammName} holding from impermanent loss
          </h2>

          <p className="mt-16 mb-20 text-secondary">
            {position.rektStatus === 'At risk'
              ? 'Your position is at risk of impermanent loss'
              : `You’ve lost ${position.rektStatus} in impermanent loss so far`}
            , get 100% protected on Bancor.
          </p>

          <h3 className="mb-10">Moving to Bancor</h3>
        </div>

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
        {!!position.nonBancorToken && (
          <div className="px-20">
            <h3 className="mb-10 mt-20 text-secondary">Exit risky position</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Image
                  alt={'Token Logo'}
                  src={nonBancorToken?.logoURI}
                  className="w-20 h-20 !rounded-full mr-10"
                />
                {prettifyNumber(position.nonBancorToken.tokenCurrentBalance)}{' '}
                {position.nonBancorToken.tokenName}
              </div>
              <div className="text-secondary">HODL in your wallet</div>
            </div>
            <div className="text-secondary ml-30">
              {prettifyNumber(
                toBigNumber(position.nonBancorToken.tokenCurrentPrice).times(
                  position.nonBancorToken.tokenCurrentBalance
                ),
                true
              )}
            </div>
          </div>
        )}

        <Button
          onClick={handleButtonClick}
          size={ButtonSize.Full}
          className="mt-20 mb-10"
          disabled={txBusy}
        >
          {txBusy ? '... waiting for confirmation' : 'Migrate and Protect'}
        </Button>

        <ProtectedSettingsV3 />

        {ApproveModal}
      </div>
    </Modal>
  );
};
