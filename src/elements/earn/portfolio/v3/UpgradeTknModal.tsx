import { Modal } from 'components/modal/Modal';
import {
  fetchProtectedPositions,
  ProtectedPosition,
} from 'services/web3/protection/positions';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { useAppSelector } from 'store';
import { setProtectedPositions } from 'store/liquidity/liquidity';
import {
  migrateNotification,
  rejectNotification,
  migrateFailedNotification,
} from 'services/notifications/notifications';
import { migrateV2Positions } from 'services/web3/protection/migration';
import { useDispatch } from 'react-redux';
import { Image } from 'components/image/Image';
import { useNavigation } from 'hooks/useNavigation';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { Switch, SwitchVariant } from 'components/switch/Switch';
import { DepositFAQ } from 'elements/earn/pools/poolsTable/v3/DepositFAQ';
import { getV3byID } from 'store/bancor/pool';
import { useState } from 'react';
import { updatePortfolioData } from 'services/web3/v3/portfolio/helpers';

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
  const { goToPage } = useNavigation();

  const [txBusy, setTxBusy] = useState(false);
  const [tosAgreed, setTosAgreed] = useState(false);

  const pools = useAppSelector((state) => state.pool.v2Pools);
  const account = useAppSelector((state) => state.user.account);
  const position = positions.length !== 0 ? positions[0] : undefined;
  const token = position?.reserveToken;
  const poolV3 = useAppSelector((state) =>
    getV3byID(state, position?.reserveToken.address ?? '')
  );

  const extVaultBalanceUsd = poolV3?.extVaultBalance.tkn ?? '0';
  const hasExtVaultBalance = !toBigNumber(extVaultBalanceUsd).isZero();

  const migrate = () => {
    setTxBusy(true);
    migrateV2Positions(
      positions,
      (txHash: string) => migrateNotification(dispatch, txHash),
      async () => {
        const positions = await fetchProtectedPositions(pools, account!);
        if (positions.length === 0) goToPage.portfolio();
        dispatch(setProtectedPositions(positions));
        await updatePortfolioData(dispatch);
      },
      () => rejectNotification(dispatch),
      () => migrateFailedNotification(dispatch)
    );
    setTxBusy(false);
    setIsOpen(false);
  };

  if (!position || !token) return null;

  return (
    <Modal large isOpen={isOpen} setIsOpen={setIsOpen} title={'Migrate to v3'}>
      <>
        <div className="p-30 pb-14">
          <div
            className={
              'bg-secondary rounded-10 p-16 space-x-16 text-20 flex items-center mb-20'
            }
          >
            <Image
              alt={'Token Logo'}
              src={poolV3?.reserveToken.logoURI}
              className={'w-40 h-40'}
            />
            <span>All {poolV3?.name}</span>
          </div>

          {hasExtVaultBalance ? (
            <>
              <div className={'flex justify-between items-center'}>
                <div>External Liquidity Protection:</div>
                <div>{prettifyNumber(extVaultBalanceUsd, true)}</div>
              </div>

              <hr className={'my-20'} />

              <div className={'text-secondary space-y-20'}>
                <p>
                  BNT distribution was disabled. Should this pool be in deficit
                  when you’re ready to withdraw from v3, you will be compensated
                  from the external liquidity protection vault.
                </p>
                <p>
                  If the protection vault is empty, your deposit will accrue the
                  pool deficit during withdrawal from v3.
                </p>
              </div>
            </>
          ) : (
            <p className={'text-secondary'}>
              After migrating to v3, if you withdraw from the v3 pool while it
              is in deficit, you'll accrue the deficit in the pool. The value
              changes over time.
            </p>
          )}
          <div
            className={
              'flex justify-between mt-20 space-x-20 items-center text-error'
            }
          >
            <Switch
              variant={SwitchVariant.ERROR}
              selected={tosAgreed}
              onChange={setTosAgreed}
            />
            <button
              className={'text-left'}
              onClick={() => setTosAgreed((prev) => !prev)}
            >
              I understand and accept the risks from migrating while BNT
              distribution is disabled.
            </button>
          </div>

          <Button
            onClick={() => migrate()}
            size={ButtonSize.Full}
            className="mt-30 mb-14"
            variant={ButtonVariant.Secondary}
            disabled={!tosAgreed || txBusy}
          >
            {txBusy
              ? '... waiting for confirmation'
              : `Migrate all ${poolV3?.name} to v3`}
          </Button>
        </div>
        <DepositFAQ />
      </>
    </Modal>
  );
};
