import { Modal } from 'components/modal/Modal';
import {
  fetchProtectedPositions,
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { Image } from 'components/image/Image';
import { Button } from 'components/button/Button';
import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';
import { useAppSelector } from 'store';
import { useMemo, useState } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
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
import { useApproveModal } from 'hooks/useApproveModal';
import { Token } from 'services/observables/tokens';
import { getTokenById } from 'store/bancor/bancor';
import { getNetworkVariables } from 'services/web3/config';
import { ApprovalContract } from 'services/web3/approval';
import { useNavigation } from 'hooks/useNavigation';
import { Pool } from 'services/observables/pools';

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
  const [useAll, setUseAll] = useState(true);
  const { goToPage } = useNavigation();

  const pools = useAppSelector<Pool[]>((state) => state.pool.v2Pools);
  const account = useAppSelector((state) => state.user.account);

  const vBNT = useAppSelector<Token | undefined>((state: any) =>
    getTokenById(state, getNetworkVariables().govToken)
  );

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
        goToPage.portfolio();
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
          className="bg-silver rounded-full h-50 w-50"
        />
        <div>Upgrade BNT</div>
        <div>
          Move all BNT to a single pool and earn from all trades in the network
        </div>
        <div className="w-full bg-fog rounded-20 p-20">
          <div className="flex items-center justify-between text-18 mb-15">
            <div>Upgrade all BNT</div>
            {`${prettifyNumber(totalBNT.tknAmount)} ${
              position.reserveToken.symbol
            } (~${prettifyNumber(totalBNT.usdAmount, true)})`}
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
            Fully upgrade paritialy protected holdings
          </div>
        </div>
        <Button
          onClick={() => migrate(totalBNT.bntPositions)}
          className="w-full h-[50px]"
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
        <div className="text-12 text-black-low font-semibold mt-30">
          {`100% Protected • ${lockDurationInDays} day cooldown • ${withdrawalFeeInPercent}% withdrawal fee`}
        </div>
      </div>
    </Modal>
  );
};
