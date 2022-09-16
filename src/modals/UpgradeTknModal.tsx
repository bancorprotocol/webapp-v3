import { Modal, ModalNames } from 'modals';
import {
  fetchProtectedPositions,
  ProtectedPosition,
} from 'services/web3/protection/positions';
import { Button, ButtonSize } from 'components/button/Button';
import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';
import { useAppSelector } from 'store';
import { useMemo } from 'react';
import { setProtectedPositions } from 'store/liquidity/liquidity';
import {
  migrateNotification,
  rejectNotification,
  migrateFailedNotification,
} from 'services/notifications/notifications';
import { migrateV2Positions } from 'services/web3/protection/migration';
import { useDispatch } from 'react-redux';
import { Pool } from 'services/observables/pools';
import { Image } from 'components/image/Image';
import { PopoverV3 } from 'components/popover/PopoverV3';
import { EmergencyInfo } from 'components/EmergencyInfo';
import { useNavigation } from 'hooks/useNavigation';
import { getModalOpen, getModalData, popModal } from 'store/modals/modals';

interface UpgradeTknProps {
  positions: ProtectedPosition[];
}
export const UpgradeTknModal = () => {
  const dispatch = useDispatch();
  const { goToPage } = useNavigation();
  const isOpen = useAppSelector((state) =>
    getModalOpen(state, ModalNames.UpgradeTkn)
  );

  const props = useAppSelector<UpgradeTknProps | undefined>((state) =>
    getModalData(state, ModalNames.UpgradeTkn)
  );

  const onClose = () => {
    dispatch(popModal(ModalNames.UpgradeTkn));
  };

  const pools = useAppSelector<Pool[]>((state) => state.pool.v2Pools);
  const account = useAppSelector((state) => state.user.account);
  const position =
    props?.positions?.length !== 0 ? props?.positions[0] : undefined;
  const token = position?.reserveToken;

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

  if (!props) return null;

  const migrate = () => {
    migrateV2Positions(
      props.positions,
      (txHash: string) => migrateNotification(dispatch, txHash),
      async () => {
        const positions = await fetchProtectedPositions(pools, account!);
        if (positions.length === 0) goToPage.portfolio();
        dispatch(setProtectedPositions(positions));
      },
      () => rejectNotification(dispatch),
      () => migrateFailedNotification(dispatch)
    );
    onClose();
  };

  if (!position || !token) return null;

  return (
    <Modal large isOpen={isOpen} setIsOpen={onClose} titleElement={<div />}>
      <div className="flex flex-col items-center gap-20 p-20 text-center">
        <Image
          alt="Token"
          src={token?.logoURI}
          className="!rounded-full h-50 w-50"
        />
        <div className="text-20">Upgrade {token.symbol}</div>
        <div className="text-black-low dark:text-white-low">
          Move all {token.symbol} to Bancor V3
        </div>
        <div className="flex flex-col items-center justify-center font-bold text-center text-error">
          <div>You are migrating from Bancor V2.1 to Bancor V3.</div>
          <div>Please note that BNT distribution is temporarily paused.</div>
          <PopoverV3
            children={<EmergencyInfo />}
            hover
            buttonElement={() => (
              <span className="underline cursor-pointer">More info</span>
            )}
          />
        </div>
        <div className="w-full p-20 bg-fog dark:bg-black rounded-20">
          <div className="flex items-center justify-between text-18 mb-15">
            <div>Upgrade all {token.symbol}</div>
          </div>
          <div className="flex items-center gap-5">
            <IconCheck className="w-10 text-primary" />
            Single Side
          </div>
          <div className="flex items-center gap-5">
            <IconCheck className="w-10 text-primary" />
            Auto-compounding
          </div>
          <div className="flex items-center gap-5">
            <IconCheck className="w-10 text-primary" />
            Fully upgrade partially protected holdings
          </div>
        </div>
        <Button onClick={() => migrate()} size={ButtonSize.Full}>
          Upgrade All
        </Button>
        <div className="text-secondary text-[13px]">
          {`${lockDurationInDays} day cooldown • ${withdrawalFeeInPercent}% withdrawal fee`}
        </div>
      </div>
    </Modal>
  );
};
