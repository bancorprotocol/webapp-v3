import { Modal } from 'components/modal/Modal';
import {
  fetchProtectedPositions,
  ProtectedPosition,
} from 'services/web3/protection/positions';
import { Button, ButtonSize } from 'components/button/Button';
import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';
import { useAppSelector } from 'store';
import { useMemo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';
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

export const UpgradeTknModal = ({
  positions,
  isOpen,
  setIsOpen,
}: {
  positions: ProtectedPosition[];
  isOpen: boolean;
  setIsOpen: Function;
}) => {
  const dispatch = useDispatch();
  const pools = useAppSelector<Pool[]>((state) => state.pool.v2Pools);
  const account = useAppSelector((state) => state.user.account);
  const position = positions.length !== 0 ? positions[0] : undefined;
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

  const migrate = () => {
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
  };

  if (!position || !token) return null;

  return (
    <Modal large isOpen={isOpen} setIsOpen={setIsOpen} titleElement={<div />}>
      <div className="flex flex-col items-center gap-20 p-20 text-center">
        <Image
          alt="Token"
          src={token?.logoURI}
          className="!rounded-full h-50 w-50"
        />
        <div>Upgrade {token.symbol}</div>
        <div>Move all {token.symbol} to Bancor V3</div>
        <div className="w-full p-20 bg-fog dark:bg-black rounded-20">
          <div className="flex items-center justify-between text-18 mb-15">
            <div>Upgrade all {token.symbol}</div>
            {`${prettifyNumber(position.claimableAmount.tknAmount)} ${
              token?.symbol
            } ${prettifyNumber(position.claimableAmount.usdAmount, true)}`}
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
        <div className="font-semibold text-12 text-black-low mt-30">
          {`100% Protected • ${lockDurationInDays} day cooldown • ${withdrawalFeeInPercent}% withdrawal fee`}
        </div>
      </div>
    </Modal>
  );
};
