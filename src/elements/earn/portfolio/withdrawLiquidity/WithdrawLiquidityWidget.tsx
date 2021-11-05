import { useState } from 'react';
import { useAppSelector } from 'redux/index';
import { getTokenById } from 'redux/bancor/bancor';
import { Token } from 'services/observables/tokens';
import { TokenInputPercentage } from 'components/tokenInputPercentage/TokenInputPercentage';
import { WithdrawLiquidityInfo } from './WithdrawLiquidityInfo';
import { LinePercentage } from 'components/linePercentage/LinePercentage';
import { Modal } from 'components/modal/Modal';
import { ProtectedPosition } from 'services/web3/protection/positions';

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
  const { pool } = protectedPosition;
  const [amount, setAmount] = useState('');
  const token = useAppSelector<Token | undefined>(
    getTokenById(pool ? pool.reserves[0].address : '')
  );

  const withdrawingBNT = true;
  const protectionNotReached = true;
  const multiplierWillReset = true;

  const outputBreakdown = [
    { color: 'blue-4', decPercent: 0.75, label: 'ETH' },
    { color: 'primary', decPercent: 0.25, label: 'BNT' },
  ];

  return (
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
        <div className="flex justify-between items-center">
          <div>Output amount</div>
          <div>123 ETH</div>
        </div>
        <div className="flex justify-between items-center mt-20">
          <div>Output breakdown</div>
          <div className="relative w-[180px]">
            <LinePercentage percentages={outputBreakdown} />
          </div>
        </div>
        {withdrawingBNT && (
          <div className="mt-20">
            BNT withdrawals are subject to a 24h lock period before they can be
            claimed.
          </div>
        )}
        <button
          onClick={() => {}}
          className={`btn-primary rounded w-full mt-20`}
        >
          Withdraw
        </button>
      </div>
    </Modal>
  );
};
