import { FC } from 'react';
import { Button, ButtonSize, ButtonVariant } from 'components/button/Button';
import { ReactNode, useState } from 'react';
import { useAppSelector } from 'store';
import { ModalV3 } from 'components/modal/ModalV3';
import { SwapSwitch } from 'elements/swapSwitch/SwapSwitch';
import { bntToken } from 'services/web3/config';
import { Switch, SwitchVariant } from 'components/switch/Switch';
import { DepositFAQ } from 'elements/earn/pools/poolsTable/v3/DepositFAQ';
import { getV3byID } from 'store/bancor/pool';
import { prettifyNumber, toBigNumber } from 'utils/helperFunctions';
import { Image } from 'components/image/Image';

interface Props {
  id: string;
  renderButton: (onClick: () => void) => ReactNode;
}

export const MigrateToV3Modal: FC<Props> = ({ id, renderButton }) => {
  const isBNT = bntToken === id;
  const poolV3 = useAppSelector((state) => getV3byID(state, id));
  const [isOpen, setIsOpen] = useState(false);
  const [txBusy, setTxBusy] = useState(false);
  const [tosAgreed, setTosAgreed] = useState(false);

  const onClose = async () => {
    setIsOpen(false);
  };

  const extVaultBalanceUsd = poolV3?.extVaultBalance.tkn ?? '0';

  const hasExtVaultBalance = !toBigNumber(extVaultBalanceUsd).isZero();

  return (
    <>
      {renderButton(() => setIsOpen(true))}

      <ModalV3
        title={'Migrate to V3'}
        setIsOpen={onClose}
        isOpen={isOpen}
        titleElement={<SwapSwitch />}
        large
      >
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
                    BNT distribution was disabled. Should this pool be in
                    deficit when you’re ready to withdraw from v3, you will be
                    compensated from the external liquidity protection vault.
                  </p>
                  <p>
                    If the protection vault is empty, your deposit will accrue
                    the pool deficit during withdrawal from v3.
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
            {!isBNT && (
              <>
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
              </>
            )}
            <Button
              size={ButtonSize.Full}
              className="mt-30 mb-14"
              variant={ButtonVariant.Secondary}
            >
              {txBusy
                ? '... waiting for confirmation'
                : `Migrate all ${poolV3?.name} to v3`}
            </Button>
          </div>
          {!isBNT && <DepositFAQ />}
        </>
      </ModalV3>
    </>
  );
};
