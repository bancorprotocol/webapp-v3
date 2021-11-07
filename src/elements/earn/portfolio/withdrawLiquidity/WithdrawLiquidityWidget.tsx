import { useRef, useState } from 'react';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import { Token } from 'services/observables/tokens';
import { TokenInputPercentage } from 'components/tokenInputPercentage/TokenInputPercentage';
import { WithdrawLiquidityInfo } from './WithdrawLiquidityInfo';
import { LinePercentage } from 'components/linePercentage/LinePercentage';
import { Modal } from 'components/modal/Modal';
import {
  ProtectedPosition,
  withdrawProtection,
} from 'services/web3/protection/positions';
import { checkPriceDeviationTooHigh } from 'services/web3/liquidity/liquidity';
import { useApproveModal } from 'hooks/useApproveModal';
import { liquidityProtection$ } from 'services/observables/contracts';
import { take } from 'rxjs/operators';
import { bntToken, getNetworkVariables } from 'services/web3/config';
import { EthNetworks } from 'services/web3/types';
import { useWeb3React } from '@web3-react/core';
import useAsyncEffect from 'use-async-effect';

interface Props {
  protectedPosition: ProtectedPosition;
  isModalOpen: boolean;
  setIsModalOpen: Function;
}

export const WithdrawLiquidityWidget = ({
  protectedPosition,
  isModalOpen,
  setIsModalOpen,
}: Props) => {
  const { chainId } = useWeb3React();
  const { positionId, reserveToken, currentCoveragePercent, pool } =
    protectedPosition;
  const { tknAmount } = protectedPosition.claimableAmount;
  const [amount, setAmount] = useState('');
  const [isPriceDeviationToHigh, setIsPriceDeviationToHigh] = useState(false);
  const approveContract = useRef('');
  const token = useAppSelector<Token | undefined>(
    getTokenById(reserveToken.address)
  );
  const gov = getNetworkVariables(chainId ?? EthNetworks.Mainnet).govToken;
  const govToken = useAppSelector<Token | undefined>(getTokenById(gov));

  const withdrawingBNT = token ? token.symbol === 'BNT' : false;
  const protectionNotReached = currentCoveragePercent !== 1;
  const multiplierWillReset = true;

  const outputBreakdown = [
    { color: 'blue-4', decPercent: 0.75, label: 'ETH' },
    { color: 'primary', decPercent: 0.25, label: 'BNT' },
  ];

  useAsyncEffect(async (isMounted) => {
    if (isMounted())
      approveContract.current = await liquidityProtection$
        .pipe(take(1))
        .toPromise();
  }, []);

  const withdraw = async () => {
    await withdrawProtection(
      positionId,
      amount,
      tknAmount,
      () => {},
      () => {},
      () => {},
      () => {}
    );
  };

  const [onStart, ModalApprove] = useApproveModal(
    [{ amount: amount, token: govToken! }],
    withdraw,
    approveContract.current
  );

  const handleWithdraw = async () => {
    const isPriceDeviationToHigh = await checkPriceDeviationTooHigh(
      pool,
      token!
    );
    if (isPriceDeviationToHigh) {
      setIsPriceDeviationToHigh(isPriceDeviationToHigh);
      return;
    }

    if (reserveToken.address === bntToken(chainId ?? EthNetworks.Mainnet))
      onStart();
    else withdraw();
  };

  return (
    <>
      <Modal
        setIsOpen={setIsModalOpen}
        isOpen={isModalOpen}
        title="Withdraw Protection"
      >
        <div className="px-20 pb-20">
          <WithdrawLiquidityInfo
            protectionNotReached={protectionNotReached}
            multiplierWillReset={multiplierWillReset}
          />
          <div className="my-20">
            <TokenInputPercentage
              label="Amount"
              token={
                token
                  ? {
                      ...token,
                      balance: protectedPosition.claimableAmount.tknAmount,
                    }
                  : undefined
              }
              amount={amount}
              setAmount={setAmount}
            />
          </div>
          <div className="flex justify-between items-center mt-20">
            <div>Output breakdown</div>
            <div className="relative w-[180px]">
              <LinePercentage percentages={outputBreakdown} />
            </div>
          </div>
          {withdrawingBNT && (
            <div className="mt-20">
              BNT withdrawals are subject to a 24h lock period before they can
              be claimed.
            </div>
          )}
          {isPriceDeviationToHigh && (
            <div className="p-20 rounded bg-error font-medium mt-20 text-white">
              Due to price volatility, withdrawing from your protected position
              is currently not available. Please try again in a few minutes.
            </div>
          )}
          <button
            onClick={() => handleWithdraw()}
            className={`btn-primary rounded w-full mt-20`}
          >
            Withdraw
          </button>
        </div>
      </Modal>
      {ModalApprove}
    </>
  );
};
