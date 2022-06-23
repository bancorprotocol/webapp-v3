import { Modal } from 'components/modal/Modal';
import {
  fetchProtectedPositions,
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { Button, ButtonSize } from 'components/button/Button';
import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';
import { useAppSelector } from 'store';
import { useMemo } from 'react';
import {
  getAllBntPositionsAndAmount,
  setProtectedPositions,
} from 'store/liquidity/liquidity';
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

export const UpgradeBntModal = ({
  position,
  isOpen,
  setIsOpen,
}: {
  position: ProtectedPositionGrouped;
  isOpen: boolean;
  setIsOpen: Function;
}) => {
  const dispatch = useDispatch();

  const pools = useAppSelector<Pool[]>((state) => state.pool.v2Pools);
  const account = useAppSelector((state) => state.user.account);

  const totalBNT = useAppSelector<{
    usdAmount: number;
    tknAmount: number;
    bntPositions: ProtectedPosition[];
  }>(getAllBntPositionsAndAmount);

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

  const migrate = (positions: ProtectedPosition[]) => {
    migrateV2Positions(
      positions,
      (txHash: string) => migrateNotification(dispatch, txHash),
      async () => {
        const positions = await fetchProtectedPositions(pools, account!);
        dispatch(setProtectedPositions(positions));
      },
      () => rejectNotification(dispatch),
      () => migrateFailedNotification(dispatch)
    );
    setIsOpen(false);
  };

  return (
    <Modal large isOpen={isOpen} setIsOpen={setIsOpen} titleElement={<div />}>
      <div className="flex flex-col items-center gap-20 p-20 text-center">
        <Image
          alt="Token"
          src={position.reserveToken.logoURI}
          className="!rounded-full h-50 w-50"
        />
        <div>Upgrade BNT</div>
        <div>
          Move all BNT to a single pool and earn from all trades in the network
        </div>
        <div className="flex flex-col items-center justify-center font-bold text-center text-error">
          <div>You are migrating from Bancor V2.1 to Bancor V3.</div>
          <div>Please note that IL protection is temporarily paused.</div>
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
            <div>Upgrade all BNT</div>
          </div>
          <div className="flex items-center gap-5">
            <IconCheck className="w-10 text-primary" />
            Single BNT pool
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
        <Button
          onClick={() => migrate(totalBNT.bntPositions)}
          size={ButtonSize.Full}
        >
          Upgrade All
        </Button>
        <button
          onClick={() =>
            migrate(
              position.subRows.length === 0 ? [position] : position.subRows
            )
          }
          className="text-primary"
        >
          No Thanks, just BNT from the {position.pool.name}
        </button>
        <div className="text-secondary text-[13px]">
          {`100% Protected • ${lockDurationInDays} day cooldown • ${withdrawalFeeInPercent}% withdrawal fee`}
        </div>
      </div>
    </Modal>
  );
};
