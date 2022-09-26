import { Modal } from 'components/modal/Modal';
import {
  fetchProtectedPositions,
  ProtectedPosition,
  ProtectedPositionGrouped,
} from 'services/web3/protection/positions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useAppSelector } from 'store';
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
import { useNavigation } from 'hooks/useNavigation';
import { Image } from 'components/image/Image';
import { getV3byID } from 'store/bancor/pool';
import { bntToken } from 'services/web3/config';
import { useState } from 'react';

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
  const { goToPage } = useNavigation();
  const [txBusy, setTxBusy] = useState(false);

  const poolV3 = useAppSelector((state) => getV3byID(state, bntToken));
  const pools = useAppSelector<Pool[]>((state) => state.pool.v2Pools);
  const account = useAppSelector((state) => state.user.account);

  const totalBNT = useAppSelector<{
    usdAmount: number;
    tknAmount: number;
    bntPositions: ProtectedPosition[];
  }>(getAllBntPositionsAndAmount);

  const migrate = (positions: ProtectedPosition[]) => {
    setTxBusy(true);
    migrateV2Positions(
      positions,
      (txHash: string) => migrateNotification(dispatch, txHash),
      async () => {
        const positions = await fetchProtectedPositions(pools, account!);
        if (positions.length === 0) goToPage.portfolio();
        dispatch(setProtectedPositions(positions));
      },
      () => rejectNotification(dispatch),
      () => migrateFailedNotification(dispatch)
    );
    setTxBusy(false);
    setIsOpen(false);
  };

  return (
    <Modal large isOpen={isOpen} setIsOpen={setIsOpen} title={'Migrate to v3'}>
      <div className="px-30 pb-30">
        <p className={'text-secondary text-16 mb-30'}>
          Move all your BNT to a single pool that earns fees from all trades in
          the network
        </p>

        <div
          className={
            'bg-secondary rounded-10 p-16 space-x-16 text-20 flex items-center'
          }
        >
          <Image
            alt={'Token Logo'}
            src={poolV3?.reserveToken.logoURI}
            className={'w-40 h-40'}
          />
          <span>All {poolV3?.name}</span>
        </div>

        <Button
          onClick={() => migrate(totalBNT.bntPositions)}
          size={ButtonSize.Full}
          className="mt-30 mb-14"
          variant={ButtonVariant.Secondary}
          disabled={txBusy}
        >
          {txBusy
            ? '... waiting for confirmation'
            : `Migrate all ${poolV3?.name} to v3`}
        </Button>

        <div className={'flex justify-center'}>
          <button
            onClick={() =>
              migrate(
                position.subRows.length === 0 ? [position] : position.subRows
              )
            }
            className="hover:text-primary text-16"
          >
            Migrate only BNT from {position.pool.name}
          </button>
        </div>
      </div>
    </Modal>
  );
};
