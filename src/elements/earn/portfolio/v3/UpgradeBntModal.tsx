import { Modal } from 'components/modal/Modal';
import { ProtectedPositionGrouped } from 'services/web3/protection/positions';
import { Image } from 'components/image/Image';
import { Button } from 'components/button/Button';
import { ReactComponent as IconCheck } from 'assets/icons/circlecheck.svg';
import { ReactComponent as IconLink } from 'assets/icons/link.svg';
import { useAppSelector } from 'store';
import { useMemo } from 'react';
import { prettifyNumber } from 'utils/helperFunctions';

export const UpgradeBntModal = ({
  position,
  isOpen,
  setIsOpen,
}: {
  position: ProtectedPositionGrouped;
  isOpen: boolean;
  setIsOpen: Function;
}) => {
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

  const balance = useMemo(
    () =>
      Number(position.reserveToken.usdPrice) * Number(position.rewardsAmount),
    [withdrawalFee]
  );

  return (
    <Modal large isOpen={isOpen} setIsOpen={setIsOpen}>
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
            {`${prettifyNumber(position.rewardsAmount)} ${
              position.reserveToken.symbol
            } (~${prettifyNumber(balance, true)})`}
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
        <Button className="w-full h-[50px]">Upgrade All</Button>
        <button className="text-primary">No Thanks, just BNT to ETH</button>
        <a
          href={'/'}
          target="_blank"
          className="flex items-center text-12 text-black-low font-semibold mt-30"
          rel="noreferrer"
        >
          {`100% Protected • ${lockDurationInDays} day cooldown • ${withdrawalFeeInPercent}% withdrawal fee`}
          <IconLink className="w-14 ml-6" />
        </a>
      </div>
    </Modal>
  );
};
